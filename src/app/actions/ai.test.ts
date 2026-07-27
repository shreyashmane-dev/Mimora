import { generateAIBirthdayWish } from "./ai";

describe("generateAIBirthdayWish", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: "test-gemini-key",
      OPENAI_API_KEY: "test-openai-key",
    };
    global.fetch = jest.fn();

    // Silence console.error for clean test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("should fallback to OpenAI if Gemini API call fails", async () => {
    // Mock the fetch responses
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.reject(new Error("Gemini API Error"))) // First call (Gemini) fails
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                intro: "OpenAI Intro",
                wishes: "OpenAI Wishes",
                quote: "OpenAI Quote"
              })
            }
          }]
        })
      })); // Second call (OpenAI) succeeds

    const result = await generateAIBirthdayWish(
      "John",
      "Johnny",
      30,
      "Friend",
      "We had fun at the park",
      "gemini"
    );

    // Verify fetch calls
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // First call should be to Gemini
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain("generativelanguage.googleapis.com");

    // Second call should be to OpenAI
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain("api.openai.com");

    // Verify we got the OpenAI response
    expect(result).toEqual({
      intro: "OpenAI Intro",
      wishes: "OpenAI Wishes",
      quote: "OpenAI Quote"
    });
  });
});
