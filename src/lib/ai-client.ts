interface GeminiRequestBody {
  contents: { parts: { text: string }[] }[];
  generationConfig?: { responseMimeType: string };
}

interface OpenAIRequestBody {
  model: string;
  messages: { role: string; content: string }[];
  response_format?: { type: string };
}

export async function generateWithGemini(
  prompt: string,
  apiKey: string,
  responseMimeType?: string
): Promise<Response> {
  const body: GeminiRequestBody = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (responseMimeType) {
    body.generationConfig = { responseMimeType };
  }

  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  responseFormatType?: string
): Promise<Response> {
  const body: OpenAIRequestBody = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  };

  if (responseFormatType) {
    body.response_format = { type: responseFormatType };
  }

  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
}
