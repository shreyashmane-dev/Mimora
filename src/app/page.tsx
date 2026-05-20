"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  Sparkles, Calendar, Heart, Shield, ArrowRight, Play, Layout, 
  MessageSquare, Share2, UploadCloud, Smile, Check, Smartphone, Volume2
} from "lucide-react";
import { motion } from "framer-motion";

const TEMPLATE_PREVIEWS = [
  { id: "midnight", name: "Midnight Luxury", bg: "bg-radial from-[#150726] to-[#040108]", accent: "text-purple-400 border-purple-500/30", text: "To Golu — Happy 25th. You are my anchor and my home." },
  { id: "vintage", name: "Memory Lane", bg: "bg-[#f5ebd9] text-[#2b221a]", accent: "text-amber-700 border-amber-600/30", text: "To my partner — 25 years of beautiful shared stories." },
  { id: "neon", name: "Neon Party", bg: "bg-[#050508] border-pink-500/40 shadow-[0_0_20px_rgba(255,0,127,0.15)]", accent: "text-pink-500 border-pink-500/30", text: "CELEBRATING GOLU! Let the EDM party beats drop." },
  { id: "classic", name: "Classic Stage", bg: "bg-gradient-to-b from-[#2a0a0f] to-[#120305] text-[#faf0d0] border border-[#d4af37]/35 shadow-[0_0_25px_rgba(212,175,55,0.15)]", accent: "text-[#faf0d0] border-[#d4af37]/30", text: "A theatrical surprise. Turn the lights down, curtains up." },
  { id: "minimal", name: "Minimal Love", bg: "bg-[#faf7f2] text-zinc-800", accent: "text-yellow-600 border-yellow-500/20", text: "To the love of my life. Where time stands still." }
];

export default function LandingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activePreview, setActivePreview] = useState(0);

  const renderHeroTitle = () => {
    const text = t("landingTitle");
    if (text.includes("unforgettable")) {
      const parts = text.split("unforgettable");
      return (
        <>
          {parts[0]}<span className="text-gradient">unforgettable</span>{parts[1]}
        </>
      );
    } else if (text.includes("अविस्मरणीय")) {
      const parts = text.split("अविस्मरणीय");
      return (
        <>
          {parts[0]}<span className="text-gradient">अविस्मरणीय</span>{parts[1]}
        </>
      );
    }
    return <span className="text-gradient">{text}</span>;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-poppins relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Cinematic Glowing Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-950/15 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-indigo-950/10 rounded-full blur-[120px] animate-pulse-glow [animation-delay:3s]" />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900/60">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles size={18} />
          </div>
          <span className="font-poppins font-semibold text-xl tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Memora
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs text-zinc-400 hover:text-white transition-colors py-2 px-3">
                {t("loginBtn")}
              </Link>
              <Link
                href="/signup"
                className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all"
              >
                {t("signupBtn")}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-400 uppercase tracking-widest">
            <Sparkles size={12} />
            THE NEXT GENERATION OF CELEBRATION
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-serif text-white tracking-wide leading-tight">
            {renderHeroTitle()}
          </h1>
          
          <p className="text-sm sm:text-md text-zinc-400 font-light leading-relaxed max-w-xl">
            {t("landingSubtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="flex items-center gap-2 py-4 px-6 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-transform hover:scale-105 cursor-pointer"
            >
              {t("createExperienceBtn")}
              <ArrowRight size={16} />
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 py-4 px-6 rounded-full font-semibold text-sm text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              <Play size={14} />
              {t("interactiveDemoBtn")}
            </a>
          </div>
        </motion.div>

        {/* Hero Interactive Preview Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 relative flex justify-center"
        >
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden group shadow-2xl">
            {/* Template preview tabs */}
            <div className="flex gap-1.5 mb-6 justify-center bg-black/40 p-1 rounded-xl">
              {TEMPLATE_PREVIEWS.map((tpl, i) => (
                <button
                  key={tpl.id}
                  onClick={() => setActivePreview(i)}
                  className={`text-[9px] font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    activePreview === i 
                      ? "bg-purple-600 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Theme {i + 1}
                </button>
              ))}
            </div>

            {/* Dynamic Card Display */}
            <div className={`rounded-2xl p-6 h-64 flex flex-col justify-between transition-all duration-700 ${TEMPLATE_PREVIEWS[activePreview].bg}`}>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono tracking-widest opacity-60">MEMORA DESIGN</span>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              
              <p className="text-sm font-serif italic text-center px-4 leading-relaxed font-light">
                "{TEMPLATE_PREVIEWS[activePreview].text}"
              </p>

              <div className="flex justify-between items-center text-[9px] opacity-60">
                <span>Theme: {TEMPLATE_PREVIEWS[activePreview].name}</span>
                <span className="flex items-center gap-1">
                  <Volume2 size={10} /> Audio Active
                </span>
              </div>
            </div>

            <p className="text-xxs text-zinc-500 font-light text-center mt-4">
              Hover/Click the tabs to toggle our four premium art directions.
            </p>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="demo" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-950">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-widest font-mono text-purple-400 uppercase block mb-3">{t("howItWorksTitle")}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide leading-tight">
            {t("howItWorksSubtitle")}
          </h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { step: "01", icon: <Smile className="text-purple-400" size={24} />, title: t("step1LTitle"), desc: t("step1LDesc") },
            { step: "02", icon: <UploadCloud className="text-purple-400" size={24} />, title: t("step2LTitle"), desc: t("step2LDesc") },
            { step: "03", icon: <Layout className="text-purple-400" size={24} />, title: t("step3LTitle"), desc: t("step3LDesc") }
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="glass-panel p-8 rounded-3xl border border-zinc-850 hover:border-purple-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="absolute top-6 right-8 text-5xl font-serif font-black text-purple-500/5 select-none">{card.step}</span>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">{card.icon}</div>
              <h3 className="text-lg font-medium text-white tracking-wide mb-3">{card.title}</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TEMPLATES PREVIEW SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-950">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[10px] tracking-widest font-mono text-purple-400 uppercase block mb-3">{t("curatedStyling")}</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">{t("fourThemes")}</h2>
          </div>
          <Link href="/templates" className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1.5">
            {t("exploreThemes")} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Midnight Luxury", color: "Purple Glow & Black", tag: "Cinematic Glow", shadow: "shadow-purple-500/5", border: "border-purple-500/10" },
            { name: "Memory Lane", color: "Warm Sepia Paper", tag: "Polaroids Stack", shadow: "shadow-amber-500/5", border: "border-amber-500/10" },
            { name: "Neon Party", color: "Cyberpunk Pink & Cyan", tag: "confetti pulse", shadow: "shadow-pink-500/5", border: "border-pink-500/10" },
            { name: "Minimal Love", color: "Cream & Gold", tag: "Spacious Fades", shadow: "shadow-yellow-500/5", border: "border-yellow-500/10" }
          ].map((item, i) => (
            <div 
              key={i}
              className={`glass-panel p-6 rounded-2xl border ${item.border} flex flex-col justify-between h-56 hover:scale-[1.02] transition-transform duration-300 ${item.shadow}`}
            >
              <div>
                <span className="text-[8px] font-mono tracking-widest uppercase py-1 px-2 rounded bg-white/5 inline-block mb-3 text-zinc-400">
                  {item.tag}
                </span>
                <h3 className="text-lg font-medium text-white tracking-wide mb-1">{item.name}</h3>
                <p className="text-xxs font-mono text-zinc-500 uppercase">{item.color}</p>
              </div>

              <Link
                href="/signup"
                className="text-[10px] font-semibold text-purple-400 flex items-center gap-1.5 py-1 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {t("useLayout")} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* AI CAPTIONS & WISHES DEMO */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-950 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[10px] tracking-widest font-mono text-purple-400 uppercase block">EMOTIONAL AI WRITER</span>
          <h2 className="text-3xl font-serif text-white tracking-wide">
            Turn bullet points into heartfelt stories.
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Provide a few key memories or jokes, and our AI constructs a cohesive, touching narrative structured with cinematic headings, core wishes, and closing author quotes.
          </p>

          <div className="space-y-3 pt-3">
            {[
              "Generated from your custom relationship context",
              "Captions tailored individually for every picture",
              "Option to manually tweak and rewrite the output"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                <span className="w-4 h-4 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px]">
                  <Check size={10} />
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Transformation card */}
        <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-850 p-6 rounded-3xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 p-4 rounded-xl border border-zinc-900 text-xs">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Your Input Notes</span>
              <p className="text-zinc-400 leading-relaxed font-light italic">
                "His nickname is Golu, turning 25. He's my best friend. Remember when we took a road trip to Shimla and got flat tire in rain, we played lofi music and laughed."
              </p>
            </div>
            
            <div className="bg-purple-950/15 border border-purple-500/10 p-4 rounded-xl text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">AI Generated Wish</span>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <h4 className="font-serif font-medium text-white text-xs">To Golu, who makes the bumpy roads of life beautiful.</h4>
              <p className="text-zinc-300 leading-relaxed font-light text-[11px]">
                "Happy 25th Birthday, my friend! Remember Shimla under the pouring rain, laughing with flat tires? You bring that exact same warm music to every dark day. Here's to more shared miles."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP SHARING DEMO */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-950 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative flex justify-center order-2 lg:order-1">
          <div className="w-64 border border-zinc-800 rounded-3xl bg-zinc-950 p-3 shadow-2xl relative overflow-hidden">
            {/* Notch */}
            <div className="w-24 h-4 bg-zinc-900 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            </div>

            {/* Chat preview */}
            <div className="space-y-4">
              <div className="bg-zinc-900 p-2.5 rounded-xl text-[10px] text-zinc-500 text-center font-light">
                Today, 10:00 PM
              </div>

              <div className="bg-purple-900/10 border border-purple-900/20 p-3 rounded-2xl max-w-[200px] ml-auto text-xs relative space-y-1">
                <p className="text-white text-[11px]">Hey ✨</p>
                <p className="text-white text-[11px]">I made something special for your birthday ❤️</p>
                <p className="text-purple-400 text-[10px] underline">memora.app/preview/for-golu</p>
                <span className="text-[8px] text-zinc-500 block text-right mt-1">10:01 PM ✓✓</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          <span className="text-[10px] tracking-widest font-mono text-purple-400 uppercase block">SHARE THE LOVE</span>
          <h2 className="text-3xl font-serif text-white tracking-wide leading-tight">
            Share instantly with a customizable WhatsApp invite.
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            As soon as you publish, Memora packages the site into a sharing link, generates a QR code, and builds a preset WhatsApp template you can click and dispatch. Simple, mobile-optimized, and direct.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center z-10 relative">
        <div className="glass-panel p-12 rounded-3xl border border-zinc-850 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          
          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide leading-tight mb-4">
            {t("finalCtaTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md mx-auto leading-relaxed mb-8">
            {t("finalCtaDesc")}
          </p>

          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 py-4.5 px-8 rounded-full font-semibold text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-transform hover:scale-105 cursor-pointer"
          >
            {t("getStartedBtn")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20 opacity-50 text-[10px] font-mono tracking-widest uppercase">
        <span>© 2026 MEMORA INC.</span>
        <div className="flex gap-4">
          <Link href="/templates" className="hover:text-white transition-colors">TEMPLATES</Link>
          <a href="#demo" className="hover:text-white transition-colors">HOW IT WORKS</a>
        </div>
      </footer>
    </div>
  );
}
