"use server";

import { Language } from "@/lib/translations";

interface WishResponse {
  intro: string;
  wishes: string;
  quote: string;
}

// Fallback dynamic database of highly emotional wishes based on relationship and language
const getFallbackWishes = (
  name: string,
  nickname: string,
  age: number,
  relationship: string,
  customMessage: string,
  length: "standard" | "large" = "standard",
  language: Language = "en"
): WishResponse => {
  const chosenName = nickname || name;
  const isLarge = length === "large";

  // Default to English fallback
  const customContext = customMessage ? `Recall when we talked about: "${customMessage}". ` : "";
  switch (relationship.toLowerCase()) {
    case "partner":
      return {
        intro: `To the love of my life, ${chosenName}, on this special day.`,
        wishes: `Happy Birthday, my love! ${age ? `Celebrating ${age} years of your beautiful light in this world.` : ""} You are my anchor, my greatest adventure, and my home. ${customContext}Every single day with you feels like a cinematic masterpiece. ${
          isLarge 
            ? "From the quiet mornings to the wild adventures we share, you have transformed my world. I find myself falling in love with you all over again with every passing season. As you step into this beautiful new chapter, know that my heart is permanently yours. I promise to stand by you, dream with you, and love you deeper through every sunset." 
            : "May this year bring you all the warmth, joy, and dreams you so deeply deserve. I love you more than words can capture."
        }`,
        quote: `"In all the world, there is no heart for me like yours." — Maya Angelou`
      };
    case "best_friend":
      return {
        intro: `To my partner in crime, ${chosenName}, who makes life infinitely brighter.`,
        wishes: `Happy Birthday to my absolute favorite human! ${customContext}Through every high, every low, and every late-night conversation, you've been my rock. ${age ? `Here's to celebrating ${age} years of you being awesome.` : "Here's to another year of unforgettable adventures."} ${
          isLarge
            ? "You are the one who knows my stories before I even write them, who laughs at my worst jokes, and who lifts me up when the world gets heavy. Our bond is something I cherish above everything else. May your day be filled with laughter that echoes, people who appreciate your beautiful soul, and adventures that will become our stories for decades to come."
            : "Thank you for matching my energy, listening to my rants, and always having my back. Cheers to you!"
        }`,
        quote: `"A true friend is the greatest of all blessings." — Francois de La Rochefoucauld`
      };
    case "sibling":
      return {
        intro: `To my sibling, my first friend, and my lifelong ally: ${chosenName}.`,
        wishes: `Happy Birthday! Growing up with you has been the greatest adventure of my life. ${customContext}${age ? `Watching you grow over these ${age} years has been a privilege.` : ""} ${
          isLarge
            ? "We've shared secrets, arguments, and endless laughter, building a bond that time or distance can never dilute. You are my constant supporter and my favorite storyteller. I hope this new chapter of your life brings you ultimate happiness, success, and everything you've worked so hard for. May your year be as extraordinary as you are."
            : "We've shared secrets, arguments, and endless laughter. I hope this new chapter of your life brings you ultimate happiness, success, and everything you've worked so hard for."
        }`,
        quote: `"Siblings: children of the same parent, each of whom is perfectly normal in their own way." — Sam Levenson`
      };
    case "parent":
      return {
        intro: `To my guide, my inspiration, and the heart of our family.`,
        wishes: `Happy Birthday, ${chosenName}! Your strength, kindness, and infinite wisdom have shaped me in ways I can never fully repay. ${customContext}On this milestone day, I want you to know how deeply you are loved and appreciated. ${
          isLarge
            ? "You have given me the courage to fly, while always keeping me grounded in love. Every sacrifice you've made and every lesson you've shared has built the foundation of my life. May this year wrap you in comfort, good health, and the deep peace you deserve. Here is to celebrating the most wonderful soul I know."
            : "May this year wrap you in comfort, good health, and the peace you deserve."
        }`,
        quote: `"All that I am, or hope to be, I owe to my parent." — Abraham Lincoln`
      };
    default:
      return {
        intro: `Celebrating the wonderful life of ${chosenName} today.`,
        wishes: `Happy Birthday, ${chosenName}! Wishing you a year filled with sweet moments, grand achievements, and peaceful days. ${customContext}Thank you for being such a wonderful presence in our lives. ${
          isLarge
            ? "You bring an irreplaceable warmth to everyone around you, and celebrating you today is an absolute joy. May your path ahead be illuminated with success, laughter, and people who cherish you for the incredible person you are."
            : "May your path ahead be illuminated with joy and prosperity."
        }`,
        quote: `"The more you praise and celebrate your life, the more there is in life to celebrate." — Oprah Winfrey`
      };
  }
};

// Fallback dynamic captions based on relationship, language
const getFallbackCaptions = (relationship: string, count: number, language: Language = "en"): string[] => {
  const enGeneric = [
    "A moment frozen in time.",
    "Laughter that echoes forever.",
    "Making memories that never fade.",
    "Warmth, joy, and perfect moments.",
    "A beautiful chapter in our story.",
    "Moments like these are everything.",
    "The simple joy of being together.",
    "A smile that lights up the entire room.",
    "Grateful for every single second.",
    "Looking back, looking forward.",
    "Pure happiness captured.",
    "Where love resides and memories grow."
  ];

  const enPartner = [
    "My favorite view in the world.",
    "Every moment with you is a treasure.",
    "The sparkle in my daily life.",
    "Holding on to your hand, always.",
    "My favorite adventure partner.",
    "Laughter is sweeter when shared with you.",
    "Wrapped up in your love."
  ];

  const key = relationship.toLowerCase();
  const pool = key === "partner" ? enPartner : enGeneric;

  // Return requested amount of captions, cycling if count > pool.length
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
};

// Server Action to Generate Wishes in the preferred language
export async function generateAIBirthdayWish(
  name: string,
  nickname: string,
  age: number,
  relationship: string,
  customMessage: string,
  model: "chatgpt" | "gemini" = "gemini",
  length: "standard" | "large" = "standard",
  language: Language = "en"
): Promise<WishResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  const isLarge = length === "large";

  const lengthInstruction = isLarge
    ? `Write a detailed, narrative-driven cinematic storytelling message (5-8 sentences, structured into 1 or 2 elegant paragraphs, capturing a deep, nostalgic, highly emotional, and heartfelt letter format).`
    : `Write a short, touching cinematic body paragraph (2-4 sentences, elegant tone, no cliches, no emojis).`;

  const prompt = `
    You are an emotional and cinematic copywriter writing a premium birthday wish card.
    The recipient is: ${name} (Nickname: ${nickname || "None"}).
    Their age today: ${age || "unspecified"}.
    Their relationship to the sender: ${relationship}.
    Additional memories/messages: "${customMessage || "None"}".
    
    The content ("intro", "wishes", and "quote") must be written in elegant English.
    
    Write a highly emotional, cinematic, and premium birthday greeting structured as a JSON object with:
    1. "intro": A short, touching introductory headline (max 10 words).
    2. "wishes": ${lengthInstruction}
    3. "quote": A beautiful, inspiring, or romantic closing quote from a famous author/philosopher OR an original poetic one that matches the theme (max 15 words).
    
    Response must be ONLY valid raw JSON conforming to the structure, no markdown wrappers, no backticks.
  `;

  // First choice: Gemini
  if (model === "gemini" && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(text.trim());
        if (parsed.intro && parsed.wishes && parsed.quote) {
          return parsed as WishResponse;
        }
      }
    } catch (err) {
      console.error("Gemini API call failed, trying OpenAI or fallback:", err);
    }
  }

  // Second choice: ChatGPT (OpenAI)
  if (openAIKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const parsed = JSON.parse(content.trim());
        if (parsed.intro && parsed.wishes && parsed.quote) {
          return parsed as WishResponse;
        }
      }
    } catch (err) {
      console.error("OpenAI API call failed, trying Gemini or fallback:", err);
    }
  }

  // Fallback call to Gemini if ChatGPT was chosen but failed and key exists
  if (model === "chatgpt" && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(text.trim());
        if (parsed.intro && parsed.wishes && parsed.quote) {
          return parsed as WishResponse;
        }
      }
    } catch (err) {
      console.error("Fallback Gemini API call failed:", err);
    }
  }

  // Final fallback to high quality templated engine
  return getFallbackWishes(name, nickname, age, relationship, customMessage, length, language);
}

// Server Action to Generate Photo Captions in the preferred language
export async function generateAICaptions(
  relationship: string,
  customMessage: string,
  photoCount: number,
  language: Language = "en"
): Promise<string[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  const prompt = `
    You are a memory storyteller. Generate exactly ${photoCount} cinematic, emotional captions for a birthday photo gallery.
    Relationship to sender: ${relationship}.
    Sender memories: "${customMessage || "None"}".
    Each caption must be a short, poetic phrase (max 6 words, no hashtags, no emojis, elegant styling).
    
    The captions must be written in elegant English.
    
    Return a JSON array of strings: ["caption1", "caption2", ...]
    Do not wrap in markdown.
  `;

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(text.trim());
        if (Array.isArray(parsed)) {
          return parsed.slice(0, photoCount);
        }
      }
    } catch (err) {
      console.error("Gemini Captions failed:", err);
    }
  }

  if (openAIKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const parsed = JSON.parse(content.trim());
        const list = Array.isArray(parsed) ? parsed : (parsed.captions || parsed.list || []);
        if (Array.isArray(list) && list.length > 0) {
          return list.slice(0, photoCount);
        }
      }
    } catch (err) {
      console.error("OpenAI Captions failed:", err);
    }
  }

  // Fallback
  return getFallbackCaptions(relationship, photoCount, language);
}

// Server Action for the Floating AI Copilot chat in the preferred language
export async function chatWithAICopilot(
  message: string,
  context: {
    recipientName?: string;
    relationship?: string;
    customMessage?: string;
  },
  model: "chatgpt" | "gemini" = "gemini",
  language: Language = "en"
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  const prompt = `
    You are Memora AI Copilot, a premium, warm, creative writing assistant for a birthday microsite platform.
    
    Current creation context:
    - Recipient Name: ${context.recipientName || "Not specified"}
    - Relationship: ${context.relationship || "Not specified"}
    - Custom Memories Entered: "${context.customMessage || "Not specified"}"
    
    The user is asking/saying: "${message}"
    
    CRITICAL: Your response MUST be written in English. Maintain a warm, encouraging, helpful, and creative cinematic storytelling tone.
    
    Provide a direct, inspiring, and highly polished reply (max 120 words). If they ask for suggestions on memories, writing custom messages, captions, or themes, give them concrete, elegant options they can copy/paste directly. Keep the tone emotional, professional, and helpful.
  `;

  if (model === "gemini" && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I am here to guide your storytelling. Try asking another question.";
      }
    } catch (err) {
      console.error("Gemini Copilot chat failed:", err);
    }
  }

  if ((model === "chatgpt" || !geminiKey) && openAIKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I am here to guide your storytelling. Try asking another question.";
      }
    } catch (err) {
      console.error("OpenAI Copilot chat failed:", err);
    }
  }

  // Fallback response generator if no keys are configured
  const lowerMsg = message.toLowerCase();
  const name = context.recipientName || "Alex";
  const rel = context.relationship || "friend";
  
  if (lowerMsg.includes("caption") || lowerMsg.includes("photo")) {
    return `Here are three elegant caption ideas for your photos celebrating ${name}:
1. "Shared laughter, timeless moments."
2. "A chapter of pure joy with you."
3. "Grateful for every single second."`;
  }
  if (lowerMsg.includes("memory") || lowerMsg.includes("what to write") || lowerMsg.includes("write")) {
    return `For a ${rel} named ${name}, try sharing memories that capture:
- The first time you realized they were an irreplaceable part of your life.
- A late-night conversation or road trip where you laughed until it hurt.
- An inside joke or shared goal that still makes you smile today.
You can draft this: "I will never forget the time we got lost on our way back and ended up talking for hours under the stars."`;
  }
  
  return `Welcome to the Memora Copilot! I am running in local fallback mode. Try asking:
- "Give me photo caption ideas"
- "What memories should I write for a ${rel}?"
- "How can I make the message sound more cinematic?"`;
}
