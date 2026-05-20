"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Paintbrush, Music, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const TEMPLATES = [
  {
    id: "midnight_luxury",
    name: "Midnight Luxury",
    theme: "Deep Purple & Black",
    font: "Playfair Display + Inter",
    accent: "Violet Glows & Shadows",
    music: "Emotional Piano",
    desc: "A premium product-page inspired design. Slow cinematic fade transitions, glowing card borders, and floating purple particle effects set against a deep dark background.",
    accentClass: "from-purple-500 to-indigo-500",
  },
  {
    id: "memory_lane",
    name: "Memory Lane",
    theme: "Sepia / Vintage Paper",
    font: "Dancing Script + Serif",
    accent: "Vintage Textures & Rotations",
    music: "Chill Lofi",
    desc: "A warm, nostalgia-rich scrapbook design. Photos are framed as tilted Polaroids that align on hover. Soft paper textures and elegant handwriting create deep emotional echoes.",
    accentClass: "from-amber-600 to-amber-800",
  },
  {
    id: "neon_party",
    name: "Neon Party",
    theme: "Cyberpunk Glow",
    font: "Poppins & Impact Sans",
    accent: "RGB Confetti & Rhythm Glows",
    music: "Party Beats",
    desc: "A futuristic cyberpunk party vibe. Featuring high-contrast neon borders in hot pink and cyan, pulse hover animations, energetic grids, and a rhythmic confetti countdown.",
    accentClass: "from-pink-500 to-cyan-500",
  },
  {
    id: "minimal_love",
    name: "Minimal Love",
    theme: "Clean Gold & Ivory",
    font: "Inter & Serif Light",
    accent: "Spacious Fades & Gold Gradients",
    music: "Cinematic Ambient",
    desc: "A spacious, editorial-style premium portfolio layout. Cream and gold accents, delicate fade transitions, and ample white space convey a clean, high-end artistic design.",
    accentClass: "from-amber-200 to-yellow-500",
  },
  {
    id: "golden_glimmer",
    name: "Golden Glimmer",
    theme: "Emerald & Gold Gilded",
    font: "Georgia + Serif",
    accent: "Gilded Velvet Gold Sparks",
    music: "Romantic Acoustic",
    desc: "An ultra-premium, dark emerald green canvas. Features sparkling gold typography, soft velvet color gradients, and slow-rising amber light particles.",
    accentClass: "from-[#d4af37] via-[#f3e5ab] to-[#aa7c11]",
  },
  {
    id: "retro_pop",
    name: "Retro Pop",
    theme: "80s Comic Pastel",
    font: "Poppins Bold + Comic Cursive",
    accent: "Thick Shadows & Neon Blocks",
    music: "Dreamy Chillwave",
    desc: "A fun, high-energy 80s pop art style. Uses blocky pastel pinks, yellow buttons with thick black border drop-shadows, and comic book grid polaroids.",
    accentClass: "from-[#ff3e6c] to-yellow-400",
  },
  {
    id: "cyber_punk",
    name: "Terminal Cyberpunk",
    theme: "Matrix Green Grid",
    font: "Courier New + Monospace",
    accent: "Matrix Glowing Digital Lines",
    music: "Dreamy Chillwave",
    desc: "A futuristic digital terminal. Monospaced green scanline grids, terminal cursor blinks, glowing green cards, and digital system overlays.",
    accentClass: "from-[#00ff66] to-[#00aa33]",
  },
  {
    id: "classic",
    name: "Classic Stage Surprise",
    theme: "Theater Curtain & Fairy Lights",
    font: "Playfair Display + Montserrat",
    accent: "Velvet Red Stage Curtain & Balloons",
    music: "Epic Cinematic",
    desc: "A stunning theatrical stage surprise. Opens with rich red velvet curtains skewing open from the center to reveal your birthday wishes, complete with hanging glowing fairy lights, realistic floating balloons, and sparkling backdrops.",
    accentClass: "from-[#ff2d55] via-[#6e0000] to-[#d4af37]",
  },
  {
    id: "ocean_breeze",
    name: "Ocean Breeze",
    theme: "Turquoise & Ocean Blues",
    font: "Quicksand + Montserrat",
    accent: "Aqua Waves & Floating Bubbles",
    music: "Tropical Ambient",
    desc: "A serene, ocean-inspired design with flowing wave animations. Gradient blues and turquoise, floating bubble particles, and smooth liquid transitions create a calming aquatic atmosphere.",
    accentClass: "from-cyan-400 to-blue-600",
  },
  {
    id: "sunset_romance",
    name: "Sunset Romance",
    theme: "Warm Sunset Palette",
    font: "Raleway + Playfair",
    accent: "Orange Flame & Purple Shadows",
    music: "Romantic Violin",
    desc: "A warm, romantic gradient from golden orange to deep purple. Silhouette foreground elements, gentle particle dust effects, and nostalgic transitions evoke a perfect sunset moment.",
    accentClass: "from-orange-400 via-pink-500 to-purple-600",
  },
  {
    id: "forest_magic",
    name: "Forest Magic",
    theme: "Deep Green & Emerald",
    font: "Poppins + Playfair",
    accent: "Glowing Fireflies & Mystic Lights",
    music: "Nature Sounds Ambient",
    desc: "An enchanted forest aesthetic with deep emerald backgrounds. Features glowing firefly particles, leaf rustling animations, and magical glow effects for a mystical birthday celebration.",
    accentClass: "from-green-500 to-emerald-700",
  },
  {
    id: "cosmic_aurora",
    name: "Cosmic Aurora",
    theme: "Northern Lights Inspired",
    font: "Space Mono + Raleway",
    accent: "Aurora Borealis Colors",
    music: "Cosmic Ambient Synth",
    desc: "A mesmerizing cosmic design inspired by the northern lights. Features flowing aurora waves, glowing stars, and gradient shifts through greens, purples, and blues for a celestial experience.",
    accentClass: "from-green-300 via-blue-500 to-purple-700",
  },
  {
    id: "vintage_rose",
    name: "Vintage Rose",
    theme: "Dusty Rose & Cream",
    font: "Bodoni Moda + Lora",
    accent: "Delicate Floral Elements",
    music: "Classical Piano",
    desc: "An elegant, timeless vintage rose design. Soft dusty rose on cream backgrounds, delicate floral borders, vintage frames, and sepia-toned photographs create a romantic, nostalgic feel.",
    accentClass: "from-rose-400 to-pink-300",
  },
  {
    id: "midnight_blue",
    name: "Midnight Blue",
    theme: "Deep Navy & Silver",
    font: "Montserrat + Lora",
    accent: "Silver Stars & Constellations",
    music: "Dreamy Electronic",
    desc: "A sophisticated midnight blue canvas with silver constellation patterns. Features starfield animations, smooth gradient transitions, and elegant typography for a luxurious nighttime feel.",
    accentClass: "from-blue-900 to-slate-700",
  },
  {
    id: "vibrant_rainbow",
    name: "Vibrant Rainbow",
    theme: "Rainbow Spectrum",
    font: "Fredoka + Montserrat",
    accent: "Colorful Gradient Flows",
    music: "Uplifting Pop",
    desc: "A joyful, colorful celebration design featuring smooth rainbow gradients. Each section transitions through vibrant spectrum colors with playful animations and celebratory confetti effects.",
    accentClass: "from-red-500 via-yellow-500 to-blue-500",
  },
  {
    id: "marble_luxury",
    name: "Marble Luxury",
    theme: "Black Marble & Gold",
    font: "Playfair Display + Lora",
    accent: "Gold Veining & Luxury Feel",
    music: "Elegant Piano",
    desc: "A premium black marble aesthetic with gold accents and veining. Features polished surfaces, luxury typography, and sophisticated animations for an ultra-refined celebration experience.",
    accentClass: "from-yellow-600 to-amber-500",
  },
  {
    id: "emerald_aurum",
    name: "Emerald Aurum",
    theme: "Royal Emerald & Gilded Gold",
    font: "Bodoni Moda + Playfair Display",
    accent: "Rich Gold Borders & Glimmer",
    music: "Elegant Piano",
    desc: "A regal emerald green canvas adorned with fine glowing gold borders, slow floating amber sparks, and classic premium serif typography for a majestic look.",
    accentClass: "from-[#ffd700] via-[#ffe885] to-[#c79a10]",
  },
  {
    id: "velvet_wine",
    name: "Velvet Wine",
    theme: "Deep Burgundy & Champagne",
    font: "Playfair Display + Lora",
    accent: "Champagne Glows & Warm Red",
    music: "Romantic Acoustic",
    desc: "A rich burgundy wine color palette with velvet gradient glows, warm champagne rose accents, rising ambient bubbles, and sophisticated classical romance.",
    accentClass: "from-[#f5d9d0] to-[#b87c65]",
  },
  {
    id: "cyber_sunset",
    name: "Cyber Sunset",
    theme: "Neon Tangerine & Electric Violet",
    font: "Space Mono + Poppins",
    accent: "Retro Sunset Glow & Cyber Grid",
    music: "Chillwave",
    desc: "A retro-synthwave sunset look with glowing neon tangerine and electric pink-violet hues. Clean lines, a stylized scanner grid, and glowing cyber overlays.",
    accentClass: "from-[#f43f5e] via-[#fb7185] to-[#ffaa00]",
  },
];

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-poppins relative pb-20">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
            <Sparkles size={12} />
            TEMPLATES LIBRARY
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide leading-tight">
            Cinematic Art Directions
          </h1>
          <p className="text-sm text-zinc-400 mt-3 font-light leading-relaxed">
            Our template systems are designed to evoke distinct memories. Choose the visual aesthetic that perfectly captures your relationship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEMPLATES.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass-panel rounded-3xl p-8 border border-zinc-850 hover:border-purple-500/25 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-serif text-white tracking-wide">
                    {tpl.name}
                  </h2>
                  <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${tpl.accentClass}`} />
                </div>

                <p className="text-xs text-zinc-400 font-light leading-relaxed mb-6">
                  {tpl.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-zinc-900 mb-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">FONT CONVENTION</span>
                    <span className="text-xs text-zinc-300 font-medium">{tpl.font}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">COLOR SYSTEM</span>
                    <span className="text-xs text-zinc-300 font-medium">{tpl.theme}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">ANIMATION</span>
                    <span className="text-xs text-zinc-300 font-medium">{tpl.accent}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">MUSIC DEFAULT</span>
                    <span className="text-xs text-zinc-300 font-medium">{tpl.music}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/create?template=${tpl.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-purple-600 border border-zinc-800 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <Paintbrush size={13} />
                Create project with this style
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
