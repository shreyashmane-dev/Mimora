import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deleteImagesFromCloudinary } from "../theme";

describe("deleteImagesFromCloudinary", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return false when Cloudinary env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await deleteImagesFromCloudinary(["https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg"]);

    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith("Cloudinary Server API credentials (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) missing. Skipping cloud asset deletion.");
  });
});
