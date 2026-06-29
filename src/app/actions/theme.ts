"use server";

import crypto from "crypto";
import { getAllProjectsForCleanup, saveProject, MemoraProject } from "@/lib/firebase";

// Extract Cloudinary public ID from secure URL
export function getCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1]; // e.g. "v17162234/folder/name.jpg" or "v17162234/name.jpg"
    
    // Remove the version segment (v followed by digits)
    const segments = pathAfterUpload.split("/");
    if (segments[0].startsWith("v") && /^\d+$/.test(segments[0].substring(1))) {
      segments.shift(); // Remove the version segment
    }
    
    // Rejoin the rest and strip extension
    const fullPublicId = segments.join("/");
    const extensionIdx = fullPublicId.lastIndexOf(".");
    if (extensionIdx !== -1) {
      return fullPublicId.substring(0, extensionIdx);
    }
    return fullPublicId;
  } catch (error) {
    console.error("Error extracting public ID from Cloudinary URL:", error);
    return null;
  }
}

// Server Action to delete images from Cloudinary securely
export async function deleteImagesFromCloudinary(urls: string[]): Promise<boolean> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary Server API credentials (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) missing. Skipping cloud asset deletion.");
    return false;
  }

  try {
    for (const url of urls) {
      const publicId = getCloudinaryPublicId(url);
      if (!publicId) continue;

      const timestamp = Math.round(new Date().getTime() / 1000);
      // Signature is SHA1 of public_id and timestamp concatenated with api_secret
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error(`Failed to delete asset ${publicId} from Cloudinary: ${res.statusText}`);
      } else {
        const result = await res.json();
        console.log(`Cloudinary destroy successful for: ${publicId}`, result);
      }
    }
    return true;
  } catch (err) {
    console.error("Error during Cloudinary asset deletion:", err);
    return false;
  }
}

// Server Action to scan and cleanup expired projects (older than 45 days)
export async function checkAndCleanupExpiredProjects(): Promise<{ cleanedCount: number; success: boolean }> {
  try {
    const projects = await getAllProjectsForCleanup();
    if (!projects || projects.length === 0) {
      return { cleanedCount: 0, success: true };
    }

    const now = new Date();
    const expiryMs = 45 * 24 * 60 * 60 * 1000; // 45 days in milliseconds
    let cleanedCount = 0;

    for (const project of projects) {
      if (!project.createdAt) continue;

      const projectDate = new Date(project.createdAt);
      const ageMs = now.getTime() - projectDate.getTime();

      // Check if project is older than 45 days and has photos to clean up
      if (ageMs > expiryMs && project.photos && project.photos.length > 0) {
        console.log(`Project ${project.id} is older than 45 days. Cleaning up ${project.photos.length} photos.`);
        
        const photoUrls = project.photos.map(p => p.url);
        // Delete from Cloudinary
        await deleteImagesFromCloudinary(photoUrls);

        // Update project in Firestore to clear photos
        const updatedProject: MemoraProject = {
          ...project,
          photos: [], // Clear photos
          customMessage: `${project.customMessage}\n\n[System Note: Photos archived after 45 days for user privacy.]`
        };

        await saveProject(updatedProject);
        cleanedCount++;
      }
    }

    return { cleanedCount, success: true };
  } catch (err) {
    console.error("Error in checkAndCleanupExpiredProjects action:", err);
    return { cleanedCount: 0, success: false };
  }
}

const TEMPLATE_STYLES: Record<string, string> = {
  midnight_luxury: "Background is deep purple-black radial gradient. Card is translucent zinc-950/60 with a purple border. Typography is sans-serif, accent is purple-to-indigo gradient.",
  memory_lane: "Background is warm sepia with vintage paper texture. Card is soft cream. Typography is elegant serif with handwritten look. Buttons are dark brown.",
  neon_party: "Background is dark cyberpunk with grid line highlights. Card is dark with strong neon pink border. Typography is sans-serif with vibrant cyan/pink text glows. Buttons are neon gradients.",
  minimal_love: "Background is light ivory/tan. Card is clean solid white. Typography is serif and spacing is spacious. Accent is soft golden tan.",
  golden_glimmer: "Background is emerald velvet green. Card is black with gold gilded border. Typography is serif, accents are gold gradients.",
  retro_pop: "Background is light pink. Card is bold white with thick solid black borders and retro comic-book shadows. Typography is bold and punchy.",
  cyber_punk: "Background is absolute black with green matrix grids. Card is bordered with glowing matrix green. Typography is monospace.",
  classic: "Background is dark red velvet radial gradient. Card is elegant white/5 translucent with golden highlights. Typography is serif, buttons are thin red neon borders.",
  sweet_sakura: "Background is pale pink. Card is soft white-pink overlay. Typography is serif, accents are rose-pink.",
  midnight_forest: "Background is deep emerald green mist. Card is translucent black. Accents are warm campfire amber.",
  galactic_odyssey: "Background is deep space nebula with constellation dots. Card is dark indigo-blue. Accents are cyan-purple neons.",
  sunset_boulevard: "Background is synthwave orange-to-purple gradient. Card is black/50. Accents are sunset yellow-pink neons.",
  royal_velvet: "Background is imperial royal blue. Card is white/5 with thin gold border. Accents are bright gold.",
  ocean_breeze: "Background is mint teal. Card is soft white-teal. Accents are deep sea green.",
  disco_fever: "Background is glowing psychedelic purple-orange. Card is glassmorphic. Accents are glittering yellow.",
  chalkboard_memories: "Background is rustic chalkboard slate. Card is sketched white. Accents are chalk white and yellow outlines.",
  comic_pop: "Background is pop yellow. Card is thick bordered comic balloon. Accents are exclamation red.",
  dreamy_clouds: "Background is pastel lilac sky. Card is semi-transparent white. Accents are dreamy purple."
};

// Server Action to generate or refine custom CSS themes using AI (Gemini or OpenAI)
export async function generateCustomThemeCss(
  userPrompt: string,
  baseTemplateId: string = "midnight_luxury",
  model: "chatgpt" | "gemini" = "gemini"
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  const templateStyle = TEMPLATE_STYLES[baseTemplateId] || TEMPLATE_STYLES.midnight_luxury;

  const prompt = `
    You are an expert CSS designer for Memora, a premium cinematic birthday card web platform.
    The user wants to customize their birthday card design.
    
    They have selected a Base Template ("${baseTemplateId}") which has this styling guide:
    "${templateStyle}"
    
    The user has also described a custom style, requested adjustments, or pasted custom design/CSS/Tailwind code:
    "${userPrompt}"

    Your task is to extract the styles from their pasted custom code or description and harmoniously BLEND them with the selected Base Template to make it look professional, modern, and beautiful. Do not let it look messy! Combine the themes cleanly.
    
    Here is the HTML structure & classes they can target:
    - Card container class: .glass-panel (this is the main card container that holds wishes, inputs, or the gallery).
    - Headings: h1, h2, h3, h4. (e.g., style the title headers or quote text).
    - Accents & text gradients: .text-gradient, .text-gradient-neon, .text-purple-400, etc.
    - Typography: customize fonts (you can use @import url('https://fonts.googleapis.com/css2?family=...')).
    - Custom animations: You can define custom keyframe animations and apply them to elements (e.g. glowing keyframes, drifting shapes).
    - Custom borders, backdrop filters, drop-shadows, and background gradients.
    
    Example override pattern:
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
    .glass-panel {
      background: rgba(15, 10, 25, 0.7) !important;
      border: 1.5px solid rgba(168, 85, 247, 0.4) !important;
      box-shadow: 0 10px 40px rgba(168, 85, 247, 0.15) !important;
      border-radius: 24px !important;
    }
    h1, h2, h3, blockquote {
      font-family: 'Playfair Display', Georgia, serif !important;
    }

    Requirements:
    1. If they pasted custom CSS code, refine it, fix errors, make it cleaner, and blend it with the base template style to look professional.
    2. If they described a theme, generate creative, beautiful CSS that matches that vibe and blends nicely.
    3. Ensure layout constraints are preserved (the cards shouldn't break). Fix overlapping margins, messy borders, and contrast issues.
    4. Output ONLY the raw CSS code. Do NOT wrap it in HTML <style> tags. Do NOT write conversational text, introductions, or explanations. If you use markdown backticks (e.g., \`\`\`css), we will strip them, but prefer returning raw CSS directly.
  `;

  let cssResult = "";

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
        cssResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (err) {
      console.error("Gemini CSS generation failed, falling back:", err);
    }
  }

  if (!cssResult && openAIKey) {
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
        cssResult = data.choices?.[0]?.message?.content || "";
      }
    } catch (err) {
      console.error("OpenAI CSS generation failed, falling back:", err);
    }
  }

  // Fallback CSS generator if keys are absent or API fails
  if (!cssResult.trim()) {
    cssResult = `/* Custom AI Generated Theme Fallback */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

/* Apply custom typography */
.font-serif, h1, h2, h3, blockquote {
  font-family: 'Playfair Display', Georgia, serif !important;
}

/* Beautiful custom card styling */
.glass-panel {
  background: rgba(15, 10, 25, 0.75) !important;
  border: 1px solid rgba(168, 85, 247, 0.3) !important;
  box-shadow: 0 8px 32px 0 rgba(168, 85, 247, 0.15) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: 24px !important;
}

/* Custom background animation override */
body, .min-h-screen {
  background: radial-gradient(circle at center, #0f051d 0%, #05020a 100%) !important;
}

/* Accent texts custom shadow glow */
.text-purple-400 {
  color: #c084fc !important;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.4);
}`;
  }

  // Strip markdown code block wrapping if present
  let cleanCss = cssResult.trim();
  if (cleanCss.startsWith("```")) {
    cleanCss = cleanCss.replace(/^```[a-zA-Z]*\n/, "");
    cleanCss = cleanCss.replace(/\n```$/, "");
  }

  return cleanCss;
}
