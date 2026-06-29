import { checkAndCleanupExpiredProjects } from "./theme";
import { getAllProjectsForCleanup } from "@/lib/firebase";

// Mock the firebase lib
jest.mock("@/lib/firebase", () => ({
  getAllProjectsForCleanup: jest.fn(),
  saveProject: jest.fn(),
}));

describe("checkAndCleanupExpiredProjects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return early with cleanedCount 0 and success true when there are no projects", async () => {
    // Setup the mock to return an empty array (the edge case)
    (getAllProjectsForCleanup as jest.Mock).mockResolvedValueOnce([]);

    // Call the function
    const result = await checkAndCleanupExpiredProjects();

    // Verify it returns the expected early exit object
    expect(result).toEqual({ cleanedCount: 0, success: true });

    // Also verify that the mock was actually called
    expect(getAllProjectsForCleanup).toHaveBeenCalledTimes(1);
  });

  it("should return early with cleanedCount 0 and success true when projects is null", async () => {
    // Setup the mock to return null (another part of the edge case check `!projects`)
    (getAllProjectsForCleanup as jest.Mock).mockResolvedValueOnce(null);

    // Call the function
    const result = await checkAndCleanupExpiredProjects();

    // Verify it returns the expected early exit object
    expect(result).toEqual({ cleanedCount: 0, success: true });

    // Also verify that the mock was actually called
    expect(getAllProjectsForCleanup).toHaveBeenCalledTimes(1);
  });
});
