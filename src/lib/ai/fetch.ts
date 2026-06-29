// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchGemini(prompt: string, key: string, requireJson: boolean = false): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (requireJson) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  return response.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchOpenAI(prompt: string, key: string, requireJson: boolean = false): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  };

  if (requireJson) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return response.json();
}
