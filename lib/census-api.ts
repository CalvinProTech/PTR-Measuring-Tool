import type { PopulationDensityData, DensityClassification } from "@/types";

const CENSUS_API_KEY = process.env.CENSUS_API_KEY;
const FCC_AREA_API = "https://geo.fcc.gov/api/census/block/find";
const CENSUS_ACS_API = "https://api.census.gov/data/2022/acs/acs5";
const FETCH_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

const FIPS_PATTERN = /^\d+$/;

// Density classification thresholds (people per square mile)
const URBAN_THRESHOLD = 2000;
const SUBURBAN_THRESHOLD = 500;

interface FccBlockResponse {
  Block: { FIPS: string };
  County: { FIPS: string; name: string };
  State: { FIPS: string; code: string; name: string };
}

/**
 * Get FIPS codes from coordinates using FCC Area API.
 * More reliable and faster than the Census Geocoder for reverse geocoding.
 */
async function getFipsFromCoordinates(
  lat: number,
  lng: number
): Promise<{
  stateFips: string;
  countyFips: string;
  tractFips: string;
  countyName: string;
} | null> {
  const url = new URL(FCC_AREA_API);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("censusYear", "2020");
  url.searchParams.set("format", "json");

  const response = await fetchWithTimeout(url.toString());
  if (!response.ok) {
    throw new Error(`FCC API error: ${response.statusText}`);
  }

  const data: FccBlockResponse = await response.json();

  if (!data.Block?.FIPS) {
    return null;
  }

  // FIPS structure: SSCCCTTTTTTBBBB (2 state + 3 county + 6 tract + 4 block)
  const fullFips = data.Block.FIPS;
  if (!FIPS_PATTERN.test(fullFips) || fullFips.length < 11) {
    return null;
  }

  const stateFips = fullFips.substring(0, 2);
  const countyFips = fullFips.substring(2, 5);
  const tractFips = fullFips.substring(5, 11);

  return {
    stateFips,
    countyFips,
    tractFips,
    countyName: data.County?.name || "",
  };
}

function classifyDensity(densityPerSqMile: number): DensityClassification {
  if (densityPerSqMile >= URBAN_THRESHOLD) return "urban";
  if (densityPerSqMile >= SUBURBAN_THRESHOLD) return "suburban";
  return "rural";
}

/**
 * Get population density data for a location.
 * Uses FCC API for FIPS lookup, Census ACS for population, TIGERweb for land area.
 */
export async function getPopulationDensity(
  lat: number,
  lng: number
): Promise<PopulationDensityData | null> {
  // Step 1: Get FIPS codes from coordinates
  const fips = await getFipsFromCoordinates(lat, lng);
  if (!fips) return null;

  // Step 2 & 3: Fetch Census population and TIGER land area in parallel
  const censusUrl = new URL(CENSUS_ACS_API);
  censusUrl.searchParams.set("get", "B01003_001E,NAME");
  censusUrl.searchParams.set("for", `tract:${fips.tractFips}`);
  censusUrl.searchParams.set(
    "in",
    `state:${fips.stateFips} county:${fips.countyFips}`
  );
  if (CENSUS_API_KEY) {
    censusUrl.searchParams.set("key", CENSUS_API_KEY);
  }

  const tigerUrl = new URL(
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2022/MapServer/8/query"
  );
  tigerUrl.searchParams.set(
    "where",
    `STATE='${fips.stateFips}' AND COUNTY='${fips.countyFips}' AND TRACT='${fips.tractFips}'`
  );
  tigerUrl.searchParams.set("outFields", "AREALAND");
  tigerUrl.searchParams.set("f", "json");

  const [censusResponse, tigerResult] = await Promise.all([
    fetchWithTimeout(censusUrl.toString()),
    fetchWithTimeout(tigerUrl.toString()).then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      if (data.features?.length > 0) {
        return data.features[0].attributes.AREALAND as number;
      }
      return null;
    }).catch(() => null), // TIGERweb failure is non-fatal
  ]);

  if (!censusResponse.ok) {
    throw new Error(`Census API error: ${censusResponse.statusText}`);
  }

  const censusData = await censusResponse.json();

  if (!censusData || censusData.length < 2) {
    return null;
  }

  const headers: string[] = censusData[0];
  const values: string[] = censusData[1];

  const popIndex = headers.indexOf("B01003_001E");
  const population = popIndex >= 0 ? parseInt(values[popIndex], 10) : 0;

  if (isNaN(population) || population < 0) {
    return null;
  }

  // 1 sq mile = 2,589,988 sq meters
  const landAreaSqMiles = tigerResult ? tigerResult / 2_589_988 : 0;

  const densityPerSqMile =
    landAreaSqMiles > 0 ? Math.round(population / landAreaSqMiles) : 0;

  // If we have land area, classify by density; otherwise fall back to population thresholds
  const classification =
    landAreaSqMiles > 0
      ? classifyDensity(densityPerSqMile)
      : population > 5000
        ? "urban"
        : population > 1000
          ? "suburban"
          : "rural";

  return {
    population,
    landAreaSqMiles: Math.round(landAreaSqMiles * 100) / 100,
    densityPerSqMile,
    classification,
    tractId: `${fips.stateFips}${fips.countyFips}${fips.tractFips}`,
    countyName: fips.countyName,
    fetchedAt: Date.now(),
  };
}
