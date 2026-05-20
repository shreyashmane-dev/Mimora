"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MemoraProject, saveProject } from "@/lib/firebase";
import { uploadImage } from "@/lib/upload";
import { generateAIBirthdayWish, generateAICaptions } from "@/app/actions/ai";
import { 
  Sparkles, ArrowLeft, ArrowRight, Upload, X, Music, Play, Pause, 
  Layout, Type, Globe, Check, Eye, AlertCircle, RefreshCw, Heart,
  Copy, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AICopilot from "./AICopilot";

// Pre-defined music track URLs
// Pre-defined music track URLs
const MUSIC_TRACKS = [
  { id: "emotional_piano", name: "Emotional Piano", category: "piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "chill_lofi", name: "Chill Lofi", category: "lofi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "party_beats", name: "Party Beats", category: "beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "cinematic_ambient", name: "Cinematic Ambient", category: "ambient", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: "golden_hour", name: "Golden Hour Sunset", category: "lofi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: "romantic_acoustic", name: "Romantic Acoustic", category: "acoustic", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { id: "epic_cinematic", name: "Epic Cinematic Story", category: "ambient", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: "chillwave", name: "Dreamy Chillwave", category: "beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
];

const TEMPLATES = [
  { 
    id: "midnight_luxury", 
    name: "Midnight Luxury", 
    theme: "Deep Purple & Black", 
    desc: "Elegant neon glow, particles, premium modern feel.",
    mockBg: "bg-gradient-to-tr from-[#130723] via-[#090310] to-[#040108]",
    mockCard: "bg-zinc-950/60 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    mockText: "text-zinc-200",
    mockAccent: "bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent font-bold",
    mockFont: "font-sans",
    mockBtn: "bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.3)]"
  },
  { 
    id: "memory_lane", 
    name: "Memory Lane", 
    theme: "Sepia / Vintage Paper", 
    desc: "Warm polaroid grid, handwritten typography, retro vibes.",
    mockBg: "bg-[#f5ebd9] border border-[#d8ccb0]/40",
    mockCard: "bg-[#faf5ec] border border-[#d8ccb0] shadow-sm text-[#2b221a]",
    mockText: "text-[#3e342a]",
    mockAccent: "text-[#7c5b3f] font-serif italic",
    mockFont: "font-serif",
    mockBtn: "bg-[#7c5b3f] text-[#faf5ec]"
  },
  { 
    id: "neon_party", 
    name: "Neon Party", 
    theme: "EDM Cyberpunk Glow", 
    desc: "Vibrant neon borders, confetti rhythm, glowing cards.",
    mockBg: "bg-[#050508]",
    mockCard: "bg-[#09090e]/70 border border-pink-500/40 shadow-[0_0_15px_rgba(255,0,127,0.15)]",
    mockText: "text-zinc-300",
    mockAccent: "bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent font-bold",
    mockFont: "font-sans",
    mockBtn: "bg-gradient-to-r from-pink-600 to-cyan-600 text-white"
  },
  { 
    id: "minimal_love", 
    name: "Minimal Love", 
    theme: "Clean Gold & Ivory", 
    desc: "Spacious layout, subtle transition animations, luxury spacing.",
    mockBg: "bg-[#faf7f2]",
    mockCard: "bg-white border border-[#e8dfcf] shadow-sm text-zinc-800",
    mockText: "text-zinc-700",
    mockAccent: "text-[#b89765] font-serif italic",
    mockFont: "font-serif",
    mockBtn: "bg-[#c5a880] text-white"
  },
  { 
    id: "golden_glimmer", 
    name: "Golden Glimmer", 
    theme: "Emerald & Gold Gilded", 
    desc: "Gilded fonts, elegant gold particles, deep velvet emerald green.",
    mockBg: "bg-gradient-to-tr from-[#021c15] via-[#043327] to-[#01140f]",
    mockCard: "bg-black/40 border border-[#b89765]/35 shadow-[0_0_15px_rgba(184,151,101,0.15)]",
    mockText: "text-[#f7f2eb]",
    mockAccent: "bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] bg-clip-text text-transparent font-bold font-serif",
    mockFont: "font-serif",
    mockBtn: "bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#021c15] font-semibold"
  },
  { 
    id: "retro_pop", 
    name: "Retro Pop", 
    theme: "80s Comic Pastel", 
    desc: "Vibrant pastel blocks, thick borders, nostalgic comic-book shadow layouts.",
    mockBg: "bg-[#ffedf2]",
    mockCard: "bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-zinc-900",
    mockText: "text-zinc-900",
    mockAccent: "text-[#ff3e6c] font-black uppercase tracking-wider",
    mockFont: "font-sans",
    mockBtn: "bg-yellow-400 text-black border border-black font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
  },
  { 
    id: "cyber_punk", 
    name: "Terminal Cyberpunk", 
    theme: "Matrix Green Grid", 
    desc: "Terminal-style green digital glow lines, cyber grids, monospace font.",
    mockBg: "bg-[#030303] border border-[#00ff66]/10",
    mockCard: "bg-black border border-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.15)] text-[#00ff66]",
    mockText: "text-zinc-200",
    mockAccent: "text-[#00ff66] font-mono tracking-widest uppercase font-bold",
    mockFont: "font-mono",
    mockBtn: "bg-transparent text-[#00ff66] border border-[#00ff66] font-mono"
  },
  { 
    id: "classic", 
    name: "Classic Stage Surprise", 
    theme: "Theater Curtain & Fairy Lights", 
    desc: "Opening red velvet curtains, warm glowing fairy lights, floating balloons, elegant typography.",
    mockBg: "bg-radial from-[#1e0a0d] to-[#040103]",
    mockCard: "bg-[#2a0a0f]/65 border border-[#d4af37]/35 shadow-[0_0_15px_rgba(212,175,55,0.25)] text-white",
    mockText: "text-zinc-200",
    mockAccent: "text-[#ff2d55] font-serif font-black italic",
    mockFont: "font-serif",
    mockBtn: "bg-transparent text-white border border-[#ff2d55] shadow-[0_0_10px_#ff2d55] font-medium"
  },
  { 
    id: "sweet_sakura", 
    name: "Sweet Sakura", 
    theme: "Cherry Blossom Soft Pink", 
    desc: "Dreamy falling cherry blossoms, pastel pink hues, romantic cursive typography.",
    mockBg: "bg-[#fff0f3]",
    mockCard: "bg-white/80 border border-pink-200/50 shadow-sm text-pink-950",
    mockText: "text-pink-900",
    mockAccent: "text-pink-600 font-serif italic",
    mockFont: "font-serif",
    mockBtn: "bg-pink-500 text-white"
  },
  { 
    id: "midnight_forest", 
    name: "Midnight Forest", 
    theme: "Emerald & Campfire Amber", 
    desc: "Deep emerald green mist, warm glowing embers, serene nature forest look.",
    mockBg: "bg-gradient-to-tr from-[#02170d] via-[#042817] to-[#011009]",
    mockCard: "bg-black/30 border border-emerald-950 text-emerald-100",
    mockText: "text-emerald-50",
    mockAccent: "text-[#ffd700] font-bold font-sans",
    mockFont: "font-sans",
    mockBtn: "bg-emerald-600 text-white"
  },
  { 
    id: "galactic_odyssey", 
    name: "Galactic Odyssey", 
    theme: "Deep Space Nebula Grid", 
    desc: "Nebula cloud dust, glowing constellations, sleek retro sci-fi details.",
    mockBg: "bg-gradient-to-b from-[#02020e] via-[#090b24] to-[#010107]",
    mockCard: "bg-[#060818]/80 border border-cyan-800/30 text-cyan-100",
    mockText: "text-zinc-100",
    mockAccent: "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold font-mono",
    mockFont: "font-mono",
    mockBtn: "bg-cyan-600 text-white shadow-[0_0_8px_#0891b2]"
  },
  { 
    id: "sunset_boulevard", 
    name: "Sunset Boulevard", 
    theme: "80s Retro Synthwave Sunset", 
    desc: "Vibrant neon-orange to deep purple gradient skies, palm tree shadows.",
    mockBg: "bg-gradient-to-b from-[#fd5e53] via-[#ff007f] to-[#2c003e]",
    mockCard: "bg-black/40 border border-pink-500/30 text-yellow-300",
    mockText: "text-white",
    mockAccent: "bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 bg-clip-text text-transparent font-extrabold",
    mockFont: "font-sans",
    mockBtn: "bg-pink-600 text-yellow-300"
  },
  { 
    id: "royal_velvet", 
    name: "Royal Velvet", 
    theme: "Imperial Blue & Gold Trim", 
    desc: "Premium royal blue backdrop, ornate golden borders, classical design structure.",
    mockBg: "bg-gradient-to-b from-[#031535] to-[#010919]",
    mockCard: "bg-white/5 border border-amber-500/30 text-white",
    mockText: "text-zinc-100",
    mockAccent: "text-[#ffd700] font-serif tracking-wide",
    mockFont: "font-serif",
    mockBtn: "bg-[#ffd700] text-[#031535] font-medium"
  },
  { 
    id: "ocean_breeze", 
    name: "Ocean Breeze", 
    theme: "Coastal Mint & Sand dunes", 
    desc: "Minimalist sea waves vibe, warm sunlight reflections, relaxed aesthetic.",
    mockBg: "bg-[#eaf4f4]",
    mockCard: "bg-white/70 border border-[#b2d8d8] text-teal-900",
    mockText: "text-teal-950",
    mockAccent: "text-[#008080] font-sans font-semibold italic",
    mockFont: "font-sans",
    mockBtn: "bg-teal-600 text-white"
  },
  { 
    id: "disco_fever", 
    name: "Disco Fever", 
    theme: "70s Colorful Groovy Glow", 
    desc: "Glittering disco balls, retro lens flares, psychedelic purple-orange color palette.",
    mockBg: "bg-gradient-to-tr from-[#9900f0] via-[#ff007f] to-[#ffaa00]",
    mockCard: "bg-white/10 border border-white/20 text-white",
    mockText: "text-white",
    mockAccent: "text-[#ffff00] font-black tracking-tighter",
    mockFont: "font-sans",
    mockBtn: "bg-yellow-400 text-black font-bold"
  },
  { 
    id: "chalkboard_memories", 
    name: "Chalkboard Memories", 
    theme: "Rustic Blackboard Sketchbook", 
    desc: "Nostalgic classroom chalkboard texture with white sketch outlines.",
    mockBg: "bg-[#1c2321]",
    mockCard: "bg-white/5 border border-white/10 text-white",
    mockText: "text-zinc-100",
    mockAccent: "text-white underline decoration-wavy decoration-yellow-400 font-serif",
    mockFont: "font-serif",
    mockBtn: "bg-transparent text-white border border-white"
  },
  { 
    id: "comic_pop", 
    name: "Comic Pop Art", 
    theme: "Retro Cartoon Speech Balloons", 
    desc: "Punchy block colors, hand-drawn comic borders, exclamation style text.",
    mockBg: "bg-[#fff200] border-2 border-black",
    mockCard: "bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] text-black",
    mockText: "text-black font-extrabold",
    mockAccent: "text-red-600 uppercase font-black",
    mockFont: "font-sans",
    mockBtn: "bg-red-600 text-white border border-black font-semibold"
  },
  { 
    id: "dreamy_clouds", 
    name: "Dreamy Cloudscape", 
    theme: "Lilac & Sky Pastel Clouds", 
    desc: "Floating dreamy pastel sky, dreamy gradient shifts, magical fantasy theme.",
    mockBg: "bg-gradient-to-b from-[#e0c3fc] to-[#8ec5fc]",
    mockCard: "bg-white/60 border border-white/20 text-[#2b2d42]",
    mockText: "text-indigo-950",
    mockAccent: "text-indigo-600 font-serif italic",
    mockFont: "font-serif",
    mockBtn: "bg-indigo-500 text-white"
  }
];

interface WizardProps {
  initialProject?: MemoraProject;
}

export default function Wizard({ initialProject }: WizardProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [recipientName, setRecipientName] = useState(initialProject?.recipientName || "");
  const [nickname, setNickname] = useState(initialProject?.nickname || "");
  const [age, setAge] = useState<number>(initialProject?.age || 18);
  const [relationship, setRelationship] = useState(initialProject?.relationship || "partner");
  const [customMessage, setCustomMessage] = useState(initialProject?.customMessage || "");
  
  // Photos State
  const [photos, setPhotos] = useState<Array<{ url: string; caption: string }>>(initialProject?.photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template State
  const [templateId, setTemplateId] = useState<'midnight_luxury' | 'memory_lane' | 'neon_party' | 'minimal_love' | 'golden_glimmer' | 'retro_pop' | 'cyber_punk' | 'classic' | 'sweet_sakura' | 'midnight_forest' | 'galactic_odyssey' | 'sunset_boulevard' | 'royal_velvet' | 'ocean_breeze' | 'disco_fever' | 'chalkboard_memories' | 'comic_pop' | 'dreamy_clouds'>(
    (initialProject?.templateId as any) || "midnight_luxury"
  );

  // Music State
  const [music, setMusic] = useState<'emotional_piano' | 'chill_lofi' | 'party_beats' | 'cinematic_ambient' | 'golden_hour' | 'romantic_acoustic' | 'epic_cinematic' | 'chillwave'>(
    (initialProject?.music as any) || "emotional_piano"
  );
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // AI Content State
  const [aiWish, setAiWish] = useState({
    intro: initialProject?.aiWish?.intro || "",
    wishes: initialProject?.aiWish?.wishes || "",
    quote: initialProject?.aiWish?.quote || "",
  });
  const [captions, setCaptions] = useState<string[]>(initialProject?.captions || []);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiModel, setAiModel] = useState<"gemini" | "chatgpt">("gemini");
  const [aiLength, setAiLength] = useState<"standard" | "large">("standard");

  // Publishing State
  const [slug, setSlug] = useState(initialProject?.slug || "");
  const [published, setPublished] = useState(initialProject?.published || false);
  const [creatorPhone, setCreatorPhone] = useState(initialProject?.creatorPhone || "");
  const [slugError, setSlugError] = useState("");

  // Auto-generate slug when name changes
  useEffect(() => {
    if (!initialProject && recipientName && currentStep === 1) {
      const generated = recipientName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(`for-${generated}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [recipientName, currentStep, initialProject]);

  // Auto-generate AI content when user enters Step 5 and wishes are empty
  useEffect(() => {
    if (currentStep === 5 && !aiWish.wishes && recipientName && !isGeneratingAI) {
      handleGenerateAI();
    }
  }, [currentStep, aiWish.wishes, recipientName]);

  // Audio Playback Preview
  const togglePlayMusic = (trackId: string, url: string) => {
    const playTrack = () => {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      playPromise
        .then(() => {
          setPlayingTrack(trackId);
        })
        .catch(e => {
          console.error("Audio playback error:", e);
          setPlayingTrack(null);
        });
    };

    if (playingTrack) {
      const prevTrack = playingTrack;
      setPlayingTrack(null);

      if (audioRef.current) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audioRef.current?.pause();
              if (prevTrack !== trackId) {
                playTrack();
              }
            })
            .catch(() => {
              audioRef.current?.pause();
              if (prevTrack !== trackId) {
                playTrack();
              }
            });
        } else {
          audioRef.current.pause();
          if (prevTrack !== trackId) {
            playTrack();
          }
        }
      }
    } else {
      playTrack();
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => audioRef.current?.pause())
            .catch(() => audioRef.current?.pause());
        } else {
          audioRef.current.pause();
        }
      }
    };
  }, []);

  // Upload Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 15) {
      alert("You can upload a maximum of 15 photos.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const url = await uploadImage(file);
        return { url, caption: "" };
      });
      const uploaded = await Promise.all(uploadPromises);
      setPhotos([...photos, ...uploaded]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    const updated = [...photos];
    updated[index].caption = caption;
    setPhotos(updated);
  };

  // AI Content Handlers
  const handleGenerateAI = async () => {
    if (!recipientName) {
      alert("Please fill in recipient details in Step 1 first.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const wishes = await generateAIBirthdayWish(
        recipientName,
        nickname,
        age,
        relationship,
        customMessage,
        aiModel,
        aiLength
      );
      setAiWish(wishes);

      // Generate AI captions for images
      if (photos.length > 0) {
        const generatedCaptions = await generateAICaptions(relationship, customMessage, photos.length);
        const updatedPhotos = photos.map((p, i) => ({
          ...p,
          caption: generatedCaptions[i] || p.caption
        }));
        setPhotos(updatedPhotos);
        setCaptions(generatedCaptions);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      alert("AI generation failed. Fallback wishes loaded.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyText = (fieldName: "memories" | "intro" | "wishes" | "quote", value: string) => {
    if (fieldName === "memories") {
      setCustomMessage(value);
    } else {
      setAiWish(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  // Submit Handler
  const handleSave = async (isPublishToggle = false) => {
    if (!recipientName) {
      alert("Recipient Name is required.");
      return;
    }
    if (!slug) {
      alert("Custom Share URL (slug) is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectId = initialProject?.id || `proj-${Math.random().toString(36).substr(2, 9)}`;
      
      const payload: Omit<MemoraProject, 'createdAt'> & { createdAt?: string } = {
        id: projectId,
        ownerId: user?.uid || "guest",
        recipientName,
        nickname,
        age: Number(age),
        relationship,
        templateId,
        photos,
        customMessage,
        aiWish,
        captions: photos.map(p => p.caption),
        music,
        slug,
        published: isPublishToggle ? !published : published,
        creatorPhone,
        ...(initialProject?.createdAt ? { createdAt: initialProject.createdAt } : {})
      };

      await saveProject(payload);
      if (isPublishToggle) {
        setPublished(!published);
      }
      
      if (!isPublishToggle) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !recipientName) {
      alert("Please enter a recipient name.");
      return;
    }
    if (currentStep === 5 && !aiWish.wishes) {
      // Trigger AI gen automatically if user progresses without it
      handleGenerateAI();
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] pt-12 pb-24 font-poppins relative">
      {/* Background radial spotlights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-950/15 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 z-10 relative">
        {/* Header navigation back to dashboard */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              router.push("/dashboard");
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="text-zinc-500 text-xs">
            {initialProject ? "EDITING MODE" : "CREATION WIZARD"}
          </div>
        </div>

        {/* Stepper Wizard Indicator */}
        <div className="flex justify-between items-center mb-12 bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-2xl relative overflow-hidden backdrop-blur-md">
          {[
            { step: 1, label: "Info", icon: <Type size={16} /> },
            { step: 2, label: "Photos", icon: <Upload size={16} /> },
            { step: 3, label: "Design", icon: <Layout size={16} /> },
            { step: 4, label: "Music", icon: <Music size={16} /> },
            { step: 5, label: "AI Writer", icon: <Sparkles size={16} /> },
            { step: 6, label: "Publish", icon: <Globe size={16} /> }
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center flex-1 relative z-10">
              <button
                disabled={item.step > currentStep && !initialProject}
                onClick={() => setCurrentStep(item.step)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                  currentStep === item.step 
                    ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : currentStep > item.step 
                    ? "bg-purple-950/20 border-purple-800 text-purple-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
              >
                {item.icon}
              </button>
              <span className={`text-[10px] mt-2 font-medium tracking-wide uppercase hidden sm:block ${
                currentStep === item.step ? "text-white" : "text-zinc-500"
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP CONTENT WRAPPERS */}
        <div className="glass-panel p-8 rounded-3xl relative border border-zinc-800/60 shadow-2xl min-h-[400px] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

          <div>
            <AnimatePresence mode="wait">
              {/* STEP 1: BASIC INFO */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-serif text-white tracking-wide">Recipient Details</h2>
                    <p className="text-xs text-zinc-400 mt-1 font-light">Who is this beautiful memory experience for?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Recipient Name *</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Nickname (Optional)</label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Golu"
                        className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Age This Birthday</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        placeholder="25"
                        min="1"
                        className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Relationship</label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 cursor-pointer"
                      >
                        <option value="partner">Partner / Lover</option>
                        <option value="best_friend">Best Friend</option>
                        <option value="sibling">Sibling</option>
                        <option value="parent">Parent</option>
                        <option value="friend">Friend</option>
                        <option value="child">Child</option>
                        <option value="other">Other / Classic</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Your WhatsApp/Mobile Number (Optional)</label>
                      <input
                        type="tel"
                        value={creatorPhone}
                        onChange={(e) => setCreatorPhone(e.target.value)}
                        placeholder="e.g. +919876543210 (include country code)"
                        className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1 font-light">Enables a quick WhatsApp reply button on the recipient's final card so they can instantly send love back.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Custom Memories / Insights</label>
                    <textarea
                      rows={4}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Share elements of your relationship, inside jokes, memorable dates or experiences that you want the AI to incorporate into the cinematic wishes..."
                      className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PHOTO UPLOADS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-serif text-white tracking-wide">Memory Gallery</h2>
                        <p className="text-xs text-zinc-400 mt-1 font-light">Upload up to 15 photos of shared experiences.</p>
                      </div>
                      <span className="text-xs font-mono text-purple-400">{photos.length}/15 uploaded</span>
                    </div>
                  </div>

                  {/* Drag-n-drop file dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-850 hover:border-purple-500/40 bg-zinc-950/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-zinc-950/50"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                      {isUploading ? (
                        <RefreshCw size={24} className="animate-spin" />
                      ) : (
                        <Upload size={24} />
                      )}
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      {isUploading ? "Uploading & Compressing..." : "Drag & Drop or Click to Upload"}
                    </p>
                    <p className="text-xs text-zinc-500 font-light">
                      Supports JPG, PNG (automatically compressed for rapid load times)
                    </p>
                  </div>

                  {/* Uploaded Gallery Grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="glass-panel rounded-xl overflow-hidden relative border border-zinc-850 group">
                          {/* Image preview */}
                          <div className="h-40 w-full relative bg-zinc-950">
                            <img
                              src={photo.url}
                              alt={`Memory ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {/* Caption edit area */}
                          <div className="p-3 bg-zinc-900/30">
                            <input
                              type="text"
                              value={photo.caption}
                              onChange={(e) => updatePhotoCaption(index, e.target.value)}
                              placeholder="Write a custom caption..."
                              className="w-full bg-zinc-950/60 border border-zinc-850/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3: TEMPLATE SELECTOR */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-serif text-white tracking-wide">Choose Cinematic Theme</h2>
                    <p className="text-xs text-zinc-400 mt-1 font-light">Select the design personality for this microsite.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Template options list */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {TEMPLATES.map((tpl) => (
                        <div
                          key={tpl.id}
                          onClick={() => setTemplateId(tpl.id as any)}
                          className={`glass-panel p-5 rounded-2xl cursor-pointer border transition-all duration-300 relative flex flex-col justify-between hover:border-purple-500/20 ${
                            templateId === tpl.id
                              ? "border-purple-500/60 bg-purple-950/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                              : "border-zinc-850 bg-zinc-900/20"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold text-white tracking-wide text-md">{tpl.name}</h3>
                              {templateId === tpl.id && (
                                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono tracking-wider block mb-3 uppercase">Theme: {tpl.theme}</span>
                            <p className="text-xs text-zinc-400 font-light leading-relaxed">{tpl.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center gap-1.5 text-[10px] font-medium text-purple-400">
                            <Eye size={12} />
                            Click to select design
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Live Interactive Mockup */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-zinc-950/20 border border-zinc-900/80 rounded-3xl p-6 shadow-inner">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-4 block">Interactive Live Preview</span>
                      
                      {/* Phone container */}
                      <div className="border border-zinc-800 bg-black rounded-3xl p-3 shadow-2xl relative aspect-[9/16] w-full max-w-[250px] flex flex-col justify-between overflow-hidden">
                        {/* Speaker notch */}
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-3.5 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center z-30">
                          <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                        </div>

                        {/* Top status details */}
                        <div className="flex justify-between items-center px-3 pt-2 pb-3 z-20">
                          <span className="text-[8px] text-zinc-500 font-mono">9:41</span>
                          <span className="text-[8px] text-zinc-500 font-mono">5G</span>
                        </div>

                        {/* Simulated cover screen */}
                        {(() => {
                          const selectedTpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
                          return (
                            <div className={`flex-grow rounded-2xl p-4 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-500 ${selectedTpl.mockBg} ${selectedTpl.mockFont} z-10`}>
                              
                              {/* Glowing sparks for dark themes */}
                              {(selectedTpl.id === "midnight_luxury" || selectedTpl.id === "neon_party" || selectedTpl.id === "golden_glimmer" || selectedTpl.id === "cyber_punk") && (
                                <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
                                  <div className="absolute top-[20%] left-[10%] w-1 bg-purple-500 h-1 rounded-full blur-[0.5px]" />
                                  <div className="absolute bottom-[30%] right-[15%] w-1.5 bg-pink-500 h-1.5 rounded-full blur-[0.5px]" />
                                </div>
                              )}

                              {/* Mock navigation */}
                              <div className="w-full flex justify-between items-center opacity-40 text-[6px] font-mono tracking-widest z-10">
                                <span>MEMORA</span>
                                <span>1 / 3</span>
                              </div>

                              {/* Heart graphic */}
                              <div className="my-auto flex flex-col items-center gap-2.5 z-10">
                                <motion.div 
                                  animate={{ scale: [1, 1.06, 1] }} 
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-sm"
                                >
                                  <Heart size={10} className="text-red-400" />
                                </motion.div>
                                <h4 className={`text-xs leading-snug font-serif ${selectedTpl.mockText}`}>
                                  Happy {age}th Birthday,<br />
                                  <span className={selectedTpl.mockAccent}>{recipientName || "Alex"}</span>!
                                </h4>
                                <p className="text-[7px] text-zinc-400 font-light max-w-[130px] mx-auto leading-normal">
                                  "A cinematic memory capsule created just for you."
                                </p>
                              </div>

                              {/* Button */}
                              <div className="w-full pb-2 z-10">
                                <span className={`py-1.5 px-3.5 rounded-full text-[8px] font-medium transition-all ${selectedTpl.mockBtn} inline-block shadow-sm`}>
                                  Unveil Memories
                                </span>
                              </div>

                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: MUSIC SELECTOR */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-serif text-white tracking-wide">Background Music</h2>
                    <p className="text-xs text-zinc-400 mt-1 font-light">
                      Choose an instrumental track that triggers after interaction.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {MUSIC_TRACKS.map((track) => (
                      <div
                        key={track.id}
                        className={`glass-panel p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                          music === track.id
                            ? "border-purple-500 bg-purple-950/10"
                            : "border-zinc-850/60 bg-zinc-900/10"
                        }`}
                      >
                        <div 
                          className="flex-grow cursor-pointer py-1"
                          onClick={() => setMusic(track.id as any)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              music === track.id ? "bg-purple-600/20 text-purple-400" : "bg-zinc-800 text-zinc-400"
                            }`}>
                              <Music size={14} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">{track.name}</h4>
                              <span className="text-[10px] text-zinc-500 capitalize">{track.category} instrumental</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePlayMusic(track.id, track.url)}
                          className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {playingTrack === track.id ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: AI WISHE GENERATOR */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-serif text-white tracking-wide">AI Wishes Generator</h2>
                      <p className="text-xs text-zinc-400 mt-1 font-light">Craft personalized, highly emotional birthday wishes using AI.</p>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={handleGenerateAI}
                      className="self-start sm:self-auto flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Generate / Re-Generate
                        </>
                      )}
                    </button>
                  </div>

                  {/* Engine & Length Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850">
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-1.5">AI Engine Mode</label>
                      <div className="flex bg-zinc-950 p-0.5 rounded-xl border border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setAiModel("gemini")}
                          className={`flex-1 py-1.5 text-xxs font-medium rounded-lg transition-all cursor-pointer ${
                            aiModel === "gemini"
                              ? "bg-purple-600 text-white font-semibold shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Gemini 2.5
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiModel("chatgpt")}
                          className={`flex-1 py-1.5 text-xxs font-medium rounded-lg transition-all cursor-pointer ${
                            aiModel === "chatgpt"
                              ? "bg-purple-600 text-white font-semibold shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          ChatGPT (GPT-4o)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-1.5">Wishes Length</label>
                      <div className="flex bg-zinc-950 p-0.5 rounded-xl border border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setAiLength("standard")}
                          className={`flex-1 py-1.5 text-xxs font-medium rounded-lg transition-all cursor-pointer ${
                            aiLength === "standard"
                              ? "bg-purple-600 text-white font-semibold shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiLength("large")}
                          className={`flex-1 py-1.5 text-xxs font-medium rounded-lg transition-all cursor-pointer ${
                            aiLength === "large"
                              ? "bg-purple-600 text-white font-semibold shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Large / Detailed
                        </button>
                      </div>
                    </div>
                  </div>

                  {isGeneratingAI ? (
                    <div className="space-y-4">
                      <div className="h-10 bg-zinc-900/50 rounded-xl animate-pulse" />
                      <div className="h-28 bg-zinc-900/50 rounded-xl animate-pulse" />
                      <div className="h-12 bg-zinc-900/50 rounded-xl animate-pulse" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-1.5">Cinematic Intro Headline</label>
                        <input
                          type="text"
                          value={aiWish.intro}
                          onChange={(e) => setAiWish({ ...aiWish, intro: e.target.value })}
                          placeholder="To the one who lights up my sky..."
                          className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-1.5">Deep Birthday Wishes</label>
                        <textarea
                          rows={4}
                          value={aiWish.wishes}
                          onChange={(e) => setAiWish({ ...aiWish, wishes: e.target.value })}
                          placeholder="Happy Birthday! You bring so much joy into the world..."
                          className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-1.5">Closing Inspiring Quote</label>
                        <input
                          type="text"
                          value={aiWish.quote}
                          onChange={(e) => setAiWish({ ...aiWish, quote: e.target.value })}
                          placeholder="A quote that highlights this milestone."
                          className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 6: PUBLISH & SHARE CONFIG */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-serif text-white tracking-wide">Publish & Share</h2>
                    <p className="text-xs text-zinc-400 mt-1 font-light">Set up the public path for this microsite experience.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xxs font-medium text-zinc-400 tracking-wider uppercase mb-2">Custom Slug (Public URL)</label>
                      <div className="flex rounded-xl overflow-hidden bg-zinc-950/60 border border-zinc-850 focus-within:border-purple-500 transition-colors">
                        <span className="bg-zinc-900 border-r border-zinc-850 px-3.5 py-3 text-xs text-zinc-500 select-none">
                          memora.app/preview/
                        </span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => {
                            const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                            setSlug(cleaned);
                          }}
                          placeholder="for-aarav"
                          className="flex-grow px-3 py-3 text-xs text-white focus:outline-none bg-transparent"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed font-light">
                        Only lowercase letters, numbers, and hyphens. Ensure this is unique.
                      </p>
                    </div>

                    {/* Live Link Preview & Copy */}
                    <div className="mt-4 p-4 rounded-2xl bg-purple-950/10 border border-purple-900/25">
                      <label className="block text-[10px] font-semibold text-purple-400 tracking-wider uppercase mb-2">Your Shareable Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== "undefined" ? `${window.location.origin}/preview/${slug}` : `memora.app/preview/${slug}`}
                          className="flex-grow bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-300 select-all focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const url = typeof window !== "undefined" ? `${window.location.origin}/preview/${slug}` : `https://memora.app/preview/${slug}`;
                            navigator.clipboard.writeText(url);
                            alert("Link copied to clipboard!");
                          }}
                          className="flex items-center justify-center p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={typeof window !== "undefined" ? `${window.location.origin}/preview/${slug}` : `/preview/${slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
                          title="Open Preview"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-850/80 flex items-start gap-3">
                      <AlertCircle size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-white mb-0.5">Privacy Notice</h4>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                          Your project must be "Published" for the recipient to view it. You can toggle this status at any time from the dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTIONS / CONTROLS (Next, Prev, Save) */}
          <div className="flex items-center justify-between pt-8 border-t border-zinc-900/60 mt-10">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Draft"}
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all cursor-pointer"
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    // Set published to true first, then save
                    setIsSubmitting(true);
                    try {
                      const projectId = initialProject?.id || `proj-${Math.random().toString(36).substr(2, 9)}`;
                      const payload: Omit<MemoraProject, 'createdAt'> & { createdAt?: string } = {
                        id: projectId,
                        ownerId: user?.uid || "guest",
                        recipientName,
                        nickname,
                        age: Number(age),
                        relationship,
                        templateId,
                        photos,
                        customMessage,
                        aiWish,
                        captions: photos.map(p => p.caption),
                        music,
                        slug,
                        published: true,
                        ...(initialProject?.createdAt ? { createdAt: initialProject.createdAt } : {})
                      };
                      await saveProject(payload);
                      router.push("/dashboard");
                    } catch (err) {
                      console.error("Publish error:", err);
                      alert("Failed to publish.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                >
                  <Check size={14} />
                  Publish & Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <AICopilot 
        context={{
          recipientName,
          relationship,
          customMessage
        }}
        onApplyText={handleApplyText}
      />
    </div>
  );
}
