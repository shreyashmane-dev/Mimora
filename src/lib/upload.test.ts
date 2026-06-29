import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadImage } from "./upload";
import imageCompression from "browser-image-compression";

vi.mock("browser-image-compression", () => {
  return {
    default: vi.fn((file) => Promise.resolve(file)),
  };
});

describe("uploadImage", () => {
  const originalEnv = process.env;
  let originalFileReader: any;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    // Set cloudinary environment variables to trigger the cloudinary path
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "test-preset";

    // Mock fetch globally
    global.fetch = vi.fn();

    // Mock console.error to avoid noise in test output
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock FileReader for jsdom environment
    originalFileReader = global.FileReader;
    class MockFileReader {
      result: string = "";
      onload: (() => void) | null = null;
      onerror: ((error: any) => void) | null = null;

      readAsDataURL() {
        setTimeout(() => {
          this.result = "data:image/png;base64,mockedBase64";
          if (this.onload) this.onload();
        }, 0);
      }
    }

    global.FileReader = MockFileReader as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });

  it("should fallback to fileToBase64 when Cloudinary upload fails", async () => {
    // Arrange: Mock fetch to return a non-ok response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const file = new File(["test content"], "test.png", { type: "image/png" });

    // Act
    const result = await uploadImage(file);

    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      "Cloudinary upload error, falling back to local base64:",
      expect.any(Error)
    );
    expect(result).toBe("data:image/png;base64,mockedBase64");
  });

  it("should successfully upload to Cloudinary when ok", async () => {
    // Arrange: Mock fetch to return a success response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ secure_url: "https://cloudinary.com/image.png" }),
    });

    const file = new File(["test content"], "test.png", { type: "image/png" });

    // Act
    const result = await uploadImage(file);

    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toBe("https://cloudinary.com/image.png");
  });

  it("should fallback to fileToBase64 when Cloudinary config is missing", async () => {
    // Arrange: Remove Cloudinary config
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    delete process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const file = new File(["test content"], "test.png", { type: "image/png" });

    // Act
    const result = await uploadImage(file);

    // Assert
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toBe("data:image/png;base64,mockedBase64");
  });
});