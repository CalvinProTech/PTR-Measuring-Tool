import { render, screen } from "@testing-library/react";
import { NearbyPlaces } from "@/components/NearbyPlaces";
import type { NearbyPlacesData, NearbyPlace } from "@/types";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: { alt: string }) => <img alt={props.alt} />,
}));

const createMockPlace = (overrides: Partial<NearbyPlace> = {}): NearbyPlace => ({
  placeId: "place_123",
  name: "Test Place",
  rating: 4.5,
  userRatingsTotal: 500,
  vicinity: "123 Main St, Tampa, FL",
  category: "restaurant",
  combinedScore: 2.5,
  photoUrl: "https://example.com/photo.jpg",
  isOpen: true,
  ...overrides,
});

const createMockData = (
  overrides: Partial<NearbyPlacesData> = {}
): NearbyPlacesData => ({
  categories: [
    {
      category: "restaurant",
      label: "Local Restaurant",
      places: [
        createMockPlace({
          placeId: "rest_1",
          name: "Joe's Diner",
          category: "restaurant",
        }),
      ],
    },
    {
      category: "school",
      label: "Nearby School",
      places: [
        createMockPlace({
          placeId: "school_1",
          name: "Lincoln Elementary",
          category: "school",
        }),
      ],
    },
    {
      category: "park",
      label: "Nearby Park",
      places: [
        createMockPlace({
          placeId: "park_1",
          name: "Central Park",
          category: "park",
        }),
      ],
    },
  ],
  searchedAt: Date.now(),
  radiusMiles: 5,
  ...overrides,
});

describe("NearbyPlaces", () => {
  const mockAddress = "123 Main St, Tampa, FL";

  it("should render the nearby places panel", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    expect(screen.getByText("Nearby Highlights")).toBeInTheDocument();
  });

  it("should display address in subtitle", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    expect(
      screen.getByText(/Top local spots near 123 Main St, Tampa, FL/i)
    ).toBeInTheDocument();
  });

  it("should display 3 place cards when all categories have places", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    expect(screen.getByText("Joe's Diner")).toBeInTheDocument();
    expect(screen.getByText("Lincoln Elementary")).toBeInTheDocument();
    expect(screen.getByText("Central Park")).toBeInTheDocument();
  });

  it("should display category labels", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    expect(screen.getByText("Local Restaurant")).toBeInTheDocument();
    expect(screen.getByText("Nearby School")).toBeInTheDocument();
    expect(screen.getByText("Nearby Park")).toBeInTheDocument();
  });

  it("should show 'Open' badge for all places", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    const openBadges = screen.getAllByText("Open");
    expect(openBadges).toHaveLength(3);
  });

  it("should display place ratings", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    // All places have 4.5 rating
    const ratings = screen.getAllByText("4.5");
    expect(ratings.length).toBeGreaterThan(0);
  });

  it("should display review counts", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    // All places have 500 reviews
    const reviews = screen.getAllByText("(500)");
    expect(reviews.length).toBeGreaterThan(0);
  });

  it("should hide categories with no places", () => {
    const dataWithEmptyCategory: NearbyPlacesData = {
      categories: [
        {
          category: "restaurant",
          label: "Local Restaurant",
          places: [
            createMockPlace({
              placeId: "rest_1",
              name: "Joe's Diner",
            }),
          ],
        },
        {
          category: "school",
          label: "Nearby School",
          places: [], // Empty
        },
        {
          category: "park",
          label: "Nearby Park",
          places: [
            createMockPlace({
              placeId: "park_1",
              name: "Central Park",
              category: "park",
            }),
          ],
        },
      ],
      searchedAt: Date.now(),
      radiusMiles: 5,
    };

    render(
      <NearbyPlaces data={dataWithEmptyCategory} address={mockAddress} />
    );

    expect(screen.getByText("Joe's Diner")).toBeInTheDocument();
    expect(screen.getByText("Central Park")).toBeInTheDocument();
    expect(screen.queryByText("Nearby School")).not.toBeInTheDocument();
  });

  it("should return null when all categories are empty", () => {
    const emptyData: NearbyPlacesData = {
      categories: [
        { category: "restaurant", label: "Local Restaurant", places: [] },
        { category: "school", label: "Nearby School", places: [] },
        { category: "park", label: "Nearby Park", places: [] },
      ],
      searchedAt: Date.now(),
      radiusMiles: 5,
    };

    const { container } = render(
      <NearbyPlaces data={emptyData} address={mockAddress} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should display place vicinity/address", () => {
    render(<NearbyPlaces data={createMockData()} address={mockAddress} />);

    // Each place has the same vicinity in mock data
    const vicinities = screen.getAllByText("123 Main St, Tampa, FL");
    expect(vicinities.length).toBeGreaterThan(0);
  });

  it("should render in a 3-column grid on larger screens", () => {
    const { container } = render(
      <NearbyPlaces data={createMockData()} address={mockAddress} />
    );

    const grid = container.querySelector(".sm\\:grid-cols-3");
    expect(grid).toBeInTheDocument();
  });
});
