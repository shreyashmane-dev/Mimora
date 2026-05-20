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
  }
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
