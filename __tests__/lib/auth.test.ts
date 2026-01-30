import { isValidRole, VALID_ROLES, DEFAULT_ROLE } from "@/lib/auth";

// Mock Clerk
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

describe("Auth Constants", () => {
  describe("VALID_ROLES", () => {
    it("should contain owner and agent", () => {
      expect(VALID_ROLES).toContain("owner");
      expect(VALID_ROLES).toContain("agent");
      expect(VALID_ROLES).toHaveLength(2);
    });
  });

  describe("DEFAULT_ROLE", () => {
    it("should be agent", () => {
      expect(DEFAULT_ROLE).toBe("agent");
    });
  });
});

describe("isValidRole", () => {
  it("should return true for valid roles", () => {
    expect(isValidRole("owner")).toBe(true);
    expect(isValidRole("agent")).toBe(true);
  });

  it("should return false for invalid roles", () => {
    expect(isValidRole("admin")).toBe(false);
    expect(isValidRole("user")).toBe(false);
    expect(isValidRole("")).toBe(false);
    expect(isValidRole("OWNER")).toBe(false); // case sensitive
  });
});

describe("getUserRole", () => {
  const { currentUser } = jest.requireMock("@clerk/nextjs/server");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return agent when user is not authenticated", async () => {
    currentUser.mockResolvedValue(null);

    const { getUserRole } = await import("@/lib/auth");
    const role = await getUserRole();

    expect(role).toBe("agent");
  });

  it("should return owner when user has owner role", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "owner" },
    });

    const { getUserRole } = await import("@/lib/auth");
    const role = await getUserRole();

    expect(role).toBe("owner");
  });

  it("should return agent when user has agent role", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "agent" },
    });

    const { getUserRole } = await import("@/lib/auth");
    const role = await getUserRole();

    expect(role).toBe("agent");
  });

  it("should return agent when user has no role set", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: {},
    });

    const { getUserRole } = await import("@/lib/auth");
    const role = await getUserRole();

    expect(role).toBe("agent");
  });

  it("should return agent when user has invalid role", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "invalid" },
    });

    const { getUserRole } = await import("@/lib/auth");
    const role = await getUserRole();

    expect(role).toBe("agent");
  });

  it("should return agent when Clerk throws error", async () => {
    currentUser.mockRejectedValue(new Error("Clerk error"));

    const { getUserRole } = await import("@/lib/auth");
    const role = await getUserRole();

    expect(role).toBe("agent");
  });
});

describe("isOwner", () => {
  const { currentUser } = jest.requireMock("@clerk/nextjs/server");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when user is owner", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "owner" },
    });

    const { isOwner } = await import("@/lib/auth");
    const result = await isOwner();

    expect(result).toBe(true);
  });

  it("should return false when user is agent", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "agent" },
    });

    const { isOwner } = await import("@/lib/auth");
    const result = await isOwner();

    expect(result).toBe(false);
  });

  it("should return false when user is not authenticated", async () => {
    currentUser.mockResolvedValue(null);

    const { isOwner } = await import("@/lib/auth");
    const result = await isOwner();

    expect(result).toBe(false);
  });
});

describe("isAgent", () => {
  const { currentUser } = jest.requireMock("@clerk/nextjs/server");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when user is agent", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "agent" },
    });

    const { isAgent } = await import("@/lib/auth");
    const result = await isAgent();

    expect(result).toBe(true);
  });

  it("should return true when user has no role (default)", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: {},
    });

    const { isAgent } = await import("@/lib/auth");
    const result = await isAgent();

    expect(result).toBe(true);
  });

  it("should return false when user is owner", async () => {
    currentUser.mockResolvedValue({
      publicMetadata: { role: "owner" },
    });

    const { isAgent } = await import("@/lib/auth");
    const result = await isAgent();

    expect(result).toBe(false);
  });
});

describe("getCurrentUserId", () => {
  const { auth } = jest.requireMock("@clerk/nextjs/server");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return userId when authenticated", async () => {
    auth.mockResolvedValue({ userId: "user_123" });

    const { getCurrentUserId } = await import("@/lib/auth");
    const userId = await getCurrentUserId();

    expect(userId).toBe("user_123");
  });

  it("should return null when not authenticated", async () => {
    auth.mockResolvedValue({ userId: null });

    const { getCurrentUserId } = await import("@/lib/auth");
    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });

  it("should return null when auth throws error", async () => {
    auth.mockRejectedValue(new Error("Auth error"));

    const { getCurrentUserId } = await import("@/lib/auth");
    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });
});
