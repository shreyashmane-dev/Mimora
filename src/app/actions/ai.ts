"use server";

interface WishResponse {
  intro: string;
  wishes: string;
  quote: string;
}

// Fallback dynamic database of highly emotional wishes based on relationship
const getFallbackWishes = (
  name: string,
  nickname: string,
  age: number,
  relationship: string,
  customMessage: string
): WishResponse => {
  const chosenName = nickname || name;
  const ageStr = age ? `${age} years of` : "a lifetime of";
  const customContext = customMessage ? `Recall when we talked about: "${customMessage}". ` : "";

  switch (relationship.toLowerCase()) {
    case "partner":
      return {
        intro: `To the love of my life, ${chosenName}, on this special day.`,
        wishes: `Happy Birthday, my love! ${age ? `Celebrating ${age} years of your beautiful light in this world.` : ""} You are my anchor, my greatest adventure, and my home. ${customContext}Every single day with you feels like a cinematic masterpiece. May this year bring you all the warmth, joy, and dreams you so deeply deserve. I love you more than words can capture.`,
        quote: `"In all the world, there is no heart for me like yours." — Maya Angelou`
      };
    case "best_friend":
      return {
        intro: `To my partner in crime, ${chosenName}, who makes life infinitely brighter.`,
        wishes: `Happy Birthday to my absolute favorite human! ${customContext}Through every high, every low, and every late-night conversation, you've been my rock. ${age ? `Here's to celebrating ${age} years of you being awesome.` : "Here's to another year of unforgettable adventures."} Thank you for matching my energy, listening to my rants, and always having my back. Cheers to you!`,
        quote: `"A true friend is the greatest of all blessings." — Francois de La Rochefoucauld`
      };
    case "sibling":
      return {
        intro: `To my sibling, my first friend, and my lifelong ally: ${chosenName}.`,
        wishes: `Happy Birthday! Growing up with you has been the greatest adventure of my life. ${customContext}${age ? `Watching you grow over these ${age} years has been a privilege.` : ""} We've shared secrets, arguments, and endless laughter. I hope this new chapter of your life brings you ultimate happiness, success, and everything you've worked so hard for.`,
        quote: `"Siblings: children of the same parent, each of whom is perfectly normal in their own way." — Sam Levenson`
      };
    case "parent":
      return {
        intro: `To my guide, my inspiration, and the heart of our family.`,
        wishes: `Happy Birthday, ${chosenName}! ${customContext}Your strength, kindness, and infinite wisdom have shaped me in ways I can never fully repay. On this milestone day, I want you to know how deeply you are loved and appreciated. May this year wrap you in comfort, good health, and the peace you deserve.`,
        quote: `"All that I am, or hope to be, I owe to my angel mother/father." — Abraham Lincoln`
      };
    default:
      return {
        intro: `Celebrating the wonderful life of ${chosenName} today.`,
        wishes: `Happy Birthday, ${chosenName}! Wishing you a year filled with sweet moments, grand achievements, and peaceful days. ${customContext}Thank you for being such a wonderful presence in our lives. May your path ahead be illuminated with joy and prosperity.`,
        quote: `"The more you praise and celebrate your life, the more there is in life to celebrate." — Oprah Winfrey`
      };
  }
};

// Fallback dynamic captions based on relationship
const getFallbackCaptions = (relationship: string, count: number): string[] => {
  const genericCaptions = [
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
    "Where love resides and memories grow.",
    "Through the lens of friendship.",
    "A celebration of you.",
    "The journey has just begun."
  ];

  const relationshipCaptions: Record<string, string[]> = {
    partner: [
      "My favorite view in the world.",
      "Every moment with you is a treasure.",
      "The sparkle in my daily life.",
      "Holding on to your hand, always.",
      "My favorite adventure partner.",
      "Laughter is sweeter when shared with you.",
      "Wrapped up in your love.",
      "A story of us, page by page.",
      "My home, my heart, my everything.",
      "To the moon and back.",
      "Falling in love with you over and over.",
      "My favourite memory of us.",
      "Making every ordinary moment magical.",
      "Forever is a long time, but I want it with you.",
      "My sunshine on the cloudiest days."
    ],
    best_friend: [
      "No one else I'd rather act silly with.",
      "Real friends don't let you do crazy things alone.",
      "Laughter, inside jokes, and endless chats.",
      "The therapist I never paid for.",
      "Partner in crime, always and forever.",
      "Through thick and thin, we stand together.",
      "Standard behavior when we meet.",
      "Making memories we will laugh about at 80.",
      "My chosen family.",
      "You know too much, so we must stay friends.",
      "A rare photo where we both look normal.",
      "Your vibe attracts your tribe, and I got the best.",
      "The Watson to my Sherlock.",
      "Cheers to more late night adventures.",
      "Best friends since day one."
    ]
  };

  const key = relationship.toLowerCase();
  const pool = relationshipCaptions[key] || genericCaptions;
  
  // Return requested amount of captions, cycling if count > pool.length
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
};

// Server Action to Generate Wishes
export async function generateAIBirthdayWish(
  name: string,
  nickname: string,
  age: number,
  relationship: string,
  customMessage: string
): Promise<WishResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const prompt = `
        You are an emotional and cinematic copywriter writing a premium birthday wish card.
        The recipient is: ${name} (Nickname: ${nickname || "None"}).
        Their age today: ${age || "unspecified"}.
        Their relationship to the sender: ${relationship}.
        Additional memories/messages: "${customMessage || "None"}".
        
        Write a highly emotional, cinematic, and premium birthday greeting structured as a JSON object with:
        1. "intro": A short, touching introductory headline (max 10 words).
        2. "wishes": A warm, deeply emotional, cinematic body paragraph (2-4 sentences, elegant tone, no cliches, no emojis).
        3. "quote": A beautiful, inspiring, or romantic closing quote from a famous author/philosopher OR a original poetic one that matches the theme (max 15 words).
        
        Response must be ONLY valid raw JSON conforming to the structure, no markdown wrappers, no backticks.
      `;

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

  if (openAIKey) {
    try {
      const prompt = `
        Write a premium, emotional, cinematic birthday wish for:
        Recipient: ${name} (Nickname: ${nickname || "None"})
        Age: ${age || "unspecified"}
        Relationship to sender: ${relationship}
        Memories context: "${customMessage || "None"}"
        
        Return JSON object with fields:
        { "intro": "headline", "wishes": "body text", "quote": "quote" }
      `;

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
      console.error("OpenAI API call failed, reverting to fallback:", err);
    }
  }

  // Final fallback to high quality templated engine
  return getFallbackWishes(name, nickname, age, relationship, customMessage);
}

// Server Action to Generate Photo Captions
export async function generateAICaptions(
  relationship: string,
  customMessage: string,
  photoCount: number
): Promise<string[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const prompt = `
        You are a memory storyteller. Generate exactly ${photoCount} cinematic, emotional captions for a birthday photo gallery.
        Relationship to sender: ${relationship}.
        Sender memories: "${customMessage || "None"}".
        Each caption must be a short, poetic phrase (max 6 words, no hashtags, no emojis, elegant styling).
        
        Return a JSON array of strings: ["caption1", "caption2", ...]
        Do not wrap in markdown.
      `;

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
      const prompt = `
        Generate an array of exactly ${photoCount} emotional, poetic, short photo captions (max 6 words each) for a photo gallery.
        Relationship: ${relationship}.
        Context: "${customMessage || "None"}".
        Return JSON format: ["caption 1", "caption 2", ...]
      `;

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
        // Handle if response is nested or just an array
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
  return getFallbackCaptions(relationship, photoCount);
}
