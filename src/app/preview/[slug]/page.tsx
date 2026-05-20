"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectBySlug, MemoraProject } from "@/lib/firebase";
import { 
  Sparkles, Music, Volume2, VolumeX, ArrowRight, ArrowLeft, 
  RotateCcw, Heart, Gift, MessageCircle, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Maps templates to CSS themes & assets
const THEMES: Record<string, {
  bgClass: string;
  cardClass: string;
  textColor: string;
  accentText: string;
  fontClass: string;
  btnClass: string;
}> = {
  midnight_luxury: {
    bgClass: "bg-radial from-[#130723] via-[#090310] to-[#040108]",
    cardClass: "bg-zinc-950/60 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    textColor: "text-zinc-200",
    accentText: "text-gradient bg-gradient-to-r from-purple-400 to-indigo-300",
    fontClass: "font-poppins",
    btnClass: "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  },
  memory_lane: {
    bgClass: "bg-[#f5ebd9] text-[#2b221a] relative before:absolute before:inset-0 before:bg-[radial-gradient(#c2b59b_1px,transparent_1px)] before:[background-size:16px_16px] before:opacity-30",
    cardClass: "bg-[#faf5ec] border border-[#d8ccb0] shadow-md shadow-[#2b221a]/5 text-[#2b221a]",
    textColor: "text-[#3e342a]",
    accentText: "text-[#7c5b3f] font-serif italic",
    fontClass: "font-serif",
    btnClass: "bg-[#7c5b3f] hover:bg-[#634832] text-[#faf5ec]",
  },
  neon_party: {
    bgClass: "bg-[#050508] relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(18,16,24,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,16,24,0.3)_1px,transparent_1px)] before:[background-size:20px_20px]",
    cardClass: "bg-[#09090e]/70 border border-pink-500/40 shadow-[0_0_25px_rgba(255,0,127,0.15)]",
    textColor: "text-zinc-300",
    accentText: "text-gradient-neon bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 font-poppins font-bold",
    fontClass: "font-poppins",
    btnClass: "bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(255,0,127,0.4)]",
  },
  minimal_love: {
    bgClass: "bg-[#faf7f2] text-zinc-800",
    cardClass: "bg-white/80 border border-[#e8dfcf] shadow-sm text-zinc-800",
    textColor: "text-zinc-700",
    accentText: "text-[#b89765] font-serif italic",
    fontClass: "font-serif",
    btnClass: "bg-[#c5a880] hover:bg-[#b0936b] text-white shadow-sm",
  },
  golden_glimmer: {
    bgClass: "bg-gradient-to-tr from-[#021c15] via-[#043327] to-[#01140f]",
    cardClass: "bg-black/40 border border-[#b89765]/35 shadow-[0_0_30px_rgba(184,151,101,0.15)]",
    textColor: "text-[#f7f2eb]",
    accentText: "text-gradient bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] font-bold font-serif",
    fontClass: "font-serif",
    btnClass: "bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:from-[#e5c158] hover:to-[#bc8f1f] text-[#021c15] font-semibold shadow-[0_0_15px_rgba(184,151,101,0.3)]",
  },
  retro_pop: {
    bgClass: "bg-[#ffedf2] text-[#1c1c24] relative before:absolute before:inset-0 before:bg-[radial-gradient(#ffccd8_1.5px,transparent_1.5px)] before:[background-size:24px_24px]",
    cardClass: "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-[#1c1c24]",
    textColor: "text-zinc-900",
    accentText: "text-[#ff3e6c] font-black uppercase tracking-wider",
    fontClass: "font-poppins",
    btnClass: "bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  },
  cyber_punk: {
    bgClass: "bg-[#030303] text-[#00ff66] relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] before:[background-size:30px_30px]",
    cardClass: "bg-black/90 border border-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.15)] text-[#00ff66]",
    textColor: "text-zinc-200",
    accentText: "text-[#00ff66] font-mono tracking-widest uppercase font-bold",
    fontClass: "font-mono",
    btnClass: "bg-transparent hover:bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66] font-mono shadow-[0_0_10px_rgba(0,255,102,0.2)]",
  },
  classic: {
    bgClass: "bg-[#0a0a0b] text-white relative bg-radial from-[#1a0a0c] to-[#050505]",
    cardClass: "bg-white/5 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-md text-white",
    textColor: "text-zinc-200",
    accentText: "text-[#ff2d55] font-serif font-black italic",
    fontClass: "font-serif",
    btnClass: "bg-transparent text-white border border-[#ff2d55] shadow-[0_0_10px_rgba(255,45,85,0.4)] hover:bg-[#ff2d55] hover:shadow-[0_0_25px_#ff2d55]",
  },
  sweet_sakura: {
    bgClass: "bg-[#fff2f5] text-pink-900 relative before:absolute before:inset-0 before:bg-[radial-gradient(#ffccd5_1.2px,transparent_1.2px)] before:[background-size:24px_24px] before:opacity-40",
    cardClass: "bg-white/85 border border-pink-200/60 shadow-[0_8px_30px_rgb(255,240,243)] text-pink-900",
    textColor: "text-pink-950 font-serif",
    accentText: "text-pink-600 font-serif italic",
    fontClass: "font-serif",
    btnClass: "bg-pink-500 hover:bg-pink-400 text-white shadow-[0_4px_15px_rgba(236,72,153,0.3)]",
  },
  midnight_forest: {
    bgClass: "bg-radial from-[#021f10] via-[#04331c] to-[#01140b] text-[#e2f0e6]",
    cardClass: "bg-black/30 border border-[#04331c]/60 shadow-[0_0_30px_rgba(4,51,28,0.2)] text-[#e2f0e6]",
    textColor: "text-[#c2dfcb]",
    accentText: "text-gradient bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-250 font-bold",
    fontClass: "font-poppins",
    btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  galactic_odyssey: {
    bgClass: "bg-[#010108] text-white relative before:absolute before:inset-0 before:bg-[radial-gradient(#ffffff_0.8px,transparent_0.8px)] before:[background-size:32px_32px] before:opacity-10",
    cardClass: "bg-[#060818]/70 border border-cyan-500/20 shadow-[0_0_30px_rgba(8,145,178,0.15)] text-white",
    textColor: "text-zinc-200",
    accentText: "text-gradient bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-300 font-mono font-bold",
    fontClass: "font-mono",
    btnClass: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]",
  },
  sunset_boulevard: {
    bgClass: "bg-gradient-to-b from-[#fd5e53] via-[#ff007f] to-[#2c003e] text-white",
    cardClass: "bg-black/50 border border-pink-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white",
    textColor: "text-zinc-150",
    accentText: "text-gradient bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-bold uppercase tracking-wider",
    fontClass: "font-poppins",
    btnClass: "bg-pink-600 hover:bg-pink-500 text-yellow-300 font-bold",
  },
  royal_velvet: {
    bgClass: "bg-radial from-[#041a3f] to-[#010a1b] text-white",
    cardClass: "bg-white/5 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white",
    textColor: "text-zinc-200",
    accentText: "text-[#ffd700] font-serif tracking-wider font-extrabold",
    fontClass: "font-serif",
    btnClass: "bg-[#ffd700] hover:bg-[#e6c200] text-[#031535] font-semibold",
  },
  ocean_breeze: {
    bgClass: "bg-[#f0f8ff] text-[#004d40] relative before:absolute before:inset-0 before:bg-[linear-gradient(#e0f2f1_1px,transparent_1px)] before:[background-size:24px_24px] before:opacity-30",
    cardClass: "bg-white/80 border border-[#b2dfdb] shadow-md text-[#004d40]",
    textColor: "text-[#00796b]",
    accentText: "text-[#008080] font-serif font-black italic",
    fontClass: "font-serif",
    btnClass: "bg-teal-600 hover:bg-teal-500 text-white",
  },
  disco_fever: {
    bgClass: "bg-gradient-to-tr from-[#6b02a2] via-[#ff007f] to-[#ff9900] text-white",
    cardClass: "bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05)] backdrop-blur-md text-white",
    textColor: "text-white",
    accentText: "text-[#ffff00] font-black uppercase tracking-widest",
    fontClass: "font-poppins",
    btnClass: "bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold border-2 border-white",
  },
  chalkboard_memories: {
    bgClass: "bg-[#252f2d] text-white relative before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] before:[background-size:20px_20px]",
    cardClass: "bg-white/5 border border-white/10 text-white backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
    textColor: "text-zinc-200",
    accentText: "text-white border-b border-dashed border-yellow-400 pb-0.5",
    fontClass: "font-serif",
    btnClass: "bg-transparent hover:bg-white/10 text-white border border-white",
  },
  comic_pop: {
    bgClass: "bg-[#ffe600] text-black relative before:absolute before:inset-0 before:bg-[radial-gradient(rgba(0,0,0,0.15)_2px,transparent_2px)] before:[background-size:24px_24px]",
    cardClass: "bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black",
    textColor: "text-black font-bold",
    accentText: "text-red-650 font-extrabold uppercase tracking-wide bg-yellow-100 px-2 py-0.5 border border-black inline-block transform -rotate-1",
    fontClass: "font-poppins",
    btnClass: "bg-red-600 hover:bg-red-500 text-white border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  },
  dreamy_clouds: {
    bgClass: "bg-gradient-to-b from-[#e3c7ff] to-[#a3c9ff] text-indigo-950",
    cardClass: "bg-white/50 border border-white/20 text-[#2b2d42] backdrop-blur-md shadow-sm",
    textColor: "text-indigo-950",
    accentText: "text-indigo-600 font-serif italic",
    fontClass: "font-serif",
    btnClass: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm",
  }
};

const MUSIC_URLS: Record<string, string> = {
  emotional_piano: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  chill_lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  party_beats: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  cinematic_ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  golden_hour: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  romantic_acoustic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  epic_cinematic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  chillwave: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
};

export default function PublicMicrositePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<MemoraProject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Experience Navigation State
  // 0: Cover/Intro, 1: Message, 2: Gallery, 3: Celebration
  const [slideIndex, setSlideIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [balloons, setBalloons] = useState<Array<{ id: number; left: number; color1: string; color2: string; delay: number }>>([]);

  // Audio Playback states
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Fetch Project
  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      try {
        const data = await getProjectBySlug(slug);
        setProject(data);
      } catch (err) {
        console.error("Error loading microsite:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  // Handle music setup on slide transitions
  const startExperience = () => {
    setSlideIndex(1);
    if (project) {
      const musicUrl = MUSIC_URLS[project.music] || MUSIC_URLS.emotional_piano;
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAudioLoaded(true);
        })
        .catch(err => {
          console.error("Autoplay/Audio play blocked or failed:", err);
          // Still let the user enjoy the site, they can click mute/unmute
          setAudioLoaded(true);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            audioRef.current?.pause();
            setIsPlaying(false);
          })
          .catch(() => {
            audioRef.current?.pause();
            setIsPlaying(false);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(e => console.error(e));
    }
  };

  // Run confetti when Celebration Slide is active
  useEffect(() => {
    if (slideIndex === 3) {
      // Confetti burst
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, animate a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [slideIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audioRef.current?.pause();
            })
            .catch(() => {
              audioRef.current?.pause();
            });
        } else {
          audioRef.current.pause();
        }
      }
    };
  }, []);

  // Curtains opening transition for Classic theme
  useEffect(() => {
    if (slideIndex === 1 && project?.templateId === "classic") {
      setCurtainsOpen(false);
      const timer = setTimeout(() => {
        setCurtainsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [slideIndex, project?.templateId]);

  // Balloon Spawning for Classic template or Slide 3 Celebration
  useEffect(() => {
    if (slideIndex === 3 || (slideIndex === 2 && project?.templateId === "classic")) {
      const colors = [
        ['#ff2d55', '#800020'], ['#74b9ff', '#0984e3'],
        ['#55efc4', '#00b894'], ['#ffeaa7', '#fdcb6e'],
        ['#a29bfe', '#6c5ce7'], ['#ff9ff3', '#f368e0']
      ];
      const spawned = Array.from({ length: 18 }).map((_, idx) => {
        const colorPair = colors[idx % colors.length];
        return {
          id: idx,
          left: Math.random() * 90 + 5, // 5% to 95%
          color1: colorPair[0],
          color2: colorPair[1],
          delay: idx * 0.6 // staggered float
        };
      });
      setBalloons(spawned);
    } else {
      setBalloons([]);
    }
  }, [slideIndex, project?.templateId]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="font-poppins text-sm text-zinc-400">Tuning the strings of memory...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#030303] px-4 text-center">
        <h2 className="text-2xl font-serif text-white mb-2">Experience Unreachable</h2>
        <p className="text-sm text-zinc-500 font-light max-w-sm">
          This birthday experience might not be published yet, or the link is incorrect.
        </p>
      </div>
    );
  }

  const theme = THEMES[project.templateId] || THEMES.midnight_luxury;

  return (
    <div className={`min-h-screen flex flex-col justify-between overflow-x-hidden relative ${theme.bgClass} ${theme.fontClass} transition-colors duration-1000`}>
      
      {/* Cinematic Ambient Effects matching each theme */}
      {project.templateId === "midnight_luxury" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
          <div className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] max-w-[600px] rounded-full bg-purple-650/15 blur-[120px] animate-cosmic-drift" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[80vw] h-[80vw] max-w-[600px] rounded-full bg-indigo-650/15 blur-[120px] animate-cosmic-drift [animation-delay:4s]" />
          <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-purple-400/30 blur-[1px] animate-float duration-10000" />
          <div className="absolute top-[60%] right-[15%] w-3 h-3 rounded-full bg-indigo-400/30 blur-[2px] animate-float duration-7000" />
        </div>
      )}

      {project.templateId === "neon_party" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
          <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[400px] rounded-full bg-pink-500/5 blur-[100px] animate-neon-flare" />
          <div className="absolute bottom-[20%] right-[10%] w-[60vw] h-[60vw] max-w-[400px] rounded-full bg-cyan-500/5 blur-[100px] animate-neon-flare [animation-delay:3s]" />
        </div>
      )}

      {project.templateId === "classic" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Spotlight cone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] md:w-[120%] h-full bg-gradient-to-b from-yellow-500/[0.04] via-transparent to-transparent pointer-events-none origin-top animate-spotlight-sweep" />
          {/* Golden dust sparkles */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:32px_32px] animate-gold-drift" />
        </div>
      )}

      {project.templateId === "golden_glimmer" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(#f3e5ab_1.2px,transparent_1.2px)] [background-size:40px_40px] animate-gold-drift" />
          <div className="absolute top-[30%] left-[15%] w-1.5 h-1.5 rounded-full bg-[#f3e5ab] blur-[1px] animate-glimmer-pulse" />
          <div className="absolute top-[70%] right-[20%] w-2 h-2 rounded-full bg-[#d4af37] blur-[1.5px] animate-glimmer-pulse [animation-delay:1.5s]" />
        </div>
      )}

      {project.templateId === "memory_lane" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-15">
          <div className="absolute inset-0 bg-repeat bg-center mix-blend-color-burn animate-film-flicker" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }} />
        </div>
      )}

      {project.templateId === "sweet_sakura" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(#ffccd5_1px,transparent_1px)] [background-size:24px_24px] animate-gold-drift" />
          <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-pink-300/10 blur-[80px] animate-cosmic-drift" />
        </div>
      )}

      {project.templateId === "midnight_forest" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
          <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-950/20 blur-[100px] animate-cosmic-drift" />
          <div className="absolute bottom-[10%] left-[30%] w-2 h-2 rounded-full bg-amber-500/30 blur-[1px] animate-float duration-[6000ms]" />
          <div className="absolute bottom-[30%] right-[25%] w-3 h-3 rounded-full bg-yellow-500/20 blur-[2px] animate-float duration-[8000ms]" />
        </div>
      )}

      {project.templateId === "galactic_odyssey" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-70">
          <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-purple-900/10 blur-[120px] animate-cosmic-drift" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-900/10 blur-[120px] animate-cosmic-drift [animation-delay:4s]" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:48px_48px] animate-gold-drift opacity-30" />
        </div>
      )}

      {project.templateId === "sunset_boulevard" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-55">
          <div className="absolute bottom-0 inset-x-0 h-40 bg-[linear-gradient(transparent,rgba(255,0,127,0.1))] border-t border-pink-500/20" />
          <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-orange-500/10 blur-[100px] animate-neon-flare" />
        </div>
      )}

      {project.templateId === "royal_velvet" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:36px_36px] animate-gold-drift opacity-25" />
          <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[100px]" />
        </div>
      )}

      {project.templateId === "ocean_breeze" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
          <div className="absolute -top-[10%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-teal-400/5 blur-[120px] animate-cosmic-drift" />
          <div className="absolute -bottom-[10%] right-[10%] w-[80vw] h-[80vw] rounded-full bg-cyan-300/5 blur-[120px] animate-cosmic-drift [animation-delay:5s]" />
        </div>
      )}

      {project.templateId === "disco_fever" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute top-[20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[80px] animate-neon-flare" />
          <div className="absolute bottom-[20%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-yellow-500/10 blur-[80px] animate-neon-flare [animation-delay:2s]" />
        </div>
      )}

      {project.templateId === "chalkboard_memories" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px] animate-gold-drift" />
        </div>
      )}

      {project.templateId === "comic_pop" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        </div>
      )}

      {project.templateId === "dreamy_clouds" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
          <div className="absolute top-[10%] left-[5%] w-[80vw] h-[40vw] rounded-full bg-white/10 blur-[60px] animate-cosmic-drift" />
          <div className="absolute bottom-[10%] right-[5%] w-[80vw] h-[40vw] rounded-full bg-indigo-300/10 blur-[70px] animate-cosmic-drift [animation-delay:3s]" />
        </div>
      )}

      {/* Floating Audio Status Button */}
      {audioLoaded && (
        <button
          onClick={toggleMute}
          className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/70 border border-white/10 text-white cursor-pointer transition-all duration-300"
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
        >
          {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {/* Header Info */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-[10px] tracking-widest font-mono opacity-60 uppercase">
            MEMORA EXPERIENCE
          </span>
        </div>
        {slideIndex > 0 && (
          <div className="text-[10px] tracking-widest font-mono opacity-60">
            {slideIndex} / 3
          </div>
        )}
      </header>

      {/* MAIN STORYTELLING VIEWPORTS */}
      <main className="flex-grow flex items-center justify-center max-w-4xl mx-auto w-full px-6 z-10 relative py-12">
        <AnimatePresence mode="wait">
          
          {/* SLIDE 0: CINEMATIC COVER */}
          {slideIndex === 0 && (
            <motion.div
              key="cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              className="text-center flex flex-col items-center max-w-xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 shadow-lg ${
                  project.templateId === "retro_pop" || project.templateId === "comic_pop"
                    ? "bg-yellow-400 border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : project.templateId === "cyber_punk" || project.templateId === "galactic_odyssey"
                    ? "bg-black border border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : project.templateId === "sweet_sakura" || project.templateId === "dreamy_clouds"
                    ? "bg-pink-100/50 border border-pink-300 text-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.2)]"
                    : project.templateId === "ocean_breeze"
                    ? "bg-teal-50 border border-teal-200 text-teal-600"
                    : project.templateId === "royal_velvet"
                    ? "bg-white/5 border border-amber-500 text-[#ffd700] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : project.templateId === "midnight_forest"
                    ? "bg-emerald-950/20 border border-emerald-800 text-emerald-400"
                    : project.templateId === "disco_fever"
                    ? "bg-yellow-400 border border-white text-black animate-bounce"
                    : project.templateId === "chalkboard_memories"
                    ? "bg-white/5 border border-white/20 text-white"
                    : "bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                }`}
              >
                <Heart size={24} className={project.templateId === "neon_party" ? "" : "animate-pulse"} />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`text-3xl md:text-5xl tracking-wide leading-tight mb-4 ${
                  theme.textColor
                }`}
              >
                Something beautiful is waiting for you.
              </motion.h1>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-sm text-zinc-400 font-light mb-8 max-w-sm leading-relaxed"
              >
                This cinematic memory capsule was curated specifically to celebrate you today.
              </motion.p>

              <motion.button
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                onClick={startExperience}
                className={`flex items-center gap-2 py-4 px-8 rounded-full font-medium text-sm transition-all duration-500 transform hover:scale-105 cursor-pointer ${theme.btnClass}`}
              >
                Unveil the Memories
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* SLIDE 1: EMOTIONAL WISH MESSAGE */}
          {slideIndex === 1 && (
            <motion.div
              key="wishes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className={`glass-panel w-full p-8 md:p-12 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[420px] ${theme.cardClass}`}
            >
              <div className="space-y-6">
                <span className="text-[10px] tracking-widest font-mono uppercase opacity-50 block">
                  — CHAPTER ONE: THE MESSAGE
                </span>
                
                <h2 className={`text-2xl md:text-4xl leading-tight font-serif tracking-wide ${theme.textColor}`}>
                  {project.aiWish?.intro}
                </h2>
                
                <p className={`text-sm md:text-lg font-light leading-relaxed opacity-90 ${theme.textColor}`}>
                  {project.aiWish?.wishes}
                </p>
              </div>

              <div className="pt-8 mt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <span className={`text-xs md:text-sm italic opacity-75 font-serif ${theme.accentText}`}>
                  {project.aiWish?.quote}
                </span>

                <button
                  onClick={() => setSlideIndex(2)}
                  className={`flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-medium text-xs self-end md:self-auto cursor-pointer transition-transform hover:scale-[1.02] ${theme.btnClass}`}
                >
                  View Memories
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: ALBUM/GALLERY OF PHOTOS */}
          {slideIndex === 2 && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="w-full space-y-8"
            >
              <div className="text-center max-w-md mx-auto mb-6">
                <span className="text-[10px] tracking-widest font-mono uppercase opacity-50 block mb-2">
                  — CHAPTER TWO: SHARED MOMENTS
                </span>
                <h2 className="text-2xl font-serif text-white tracking-wide">
                  Memory Gallery
                </h2>
              </div>

              {/* Render templates-specific layout */}
              {project.photos.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 font-light text-sm">
                  No memories uploaded. But the love remains constant.
                </div>
              ) : (
                /* Interactive Slideshow instead of static grid */
                <div className="w-full space-y-6 flex flex-col justify-between min-h-[460px]">
                  <div className="text-center max-w-md mx-auto">
                    <span className="text-[10px] tracking-widest font-mono uppercase opacity-55 block mb-1">
                      — CHAPTER TWO: SHARED MOMENTS
                    </span>
                    <h2 className="text-xl font-serif text-white tracking-wide">
                      Memory Album ({photoIndex + 1} / {project.photos.length})
                    </h2>
                  </div>

                  {/* Slideshow Photo Viewer */}
                  <div className="flex-grow flex items-center justify-center py-4 relative min-h-[300px]">
                    {/* Left Arrow Button */}
                    <button
                      onClick={() => {
                        if (photoIndex > 0) {
                          setPhotoIndex(photoIndex - 1);
                        } else {
                          setSlideIndex(1); // Go back to message if on first photo
                        }
                      }}
                      className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/75 border border-white/10 text-white cursor-pointer transition-colors"
                      aria-label="Previous Memory"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    {/* Right Arrow Button */}
                    <button
                      onClick={() => {
                        if (photoIndex < project.photos.length - 1) {
                          setPhotoIndex(photoIndex + 1);
                        } else {
                          setSlideIndex(3); // Go to final celebration slide
                        }
                      }}
                      className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/75 border border-white/10 text-white cursor-pointer transition-colors"
                      aria-label="Next Memory"
                    >
                      <ArrowRight size={16} />
                    </button>

                    {/* Styled Frame depending on template */}
                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={photoIndex}
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          className="w-full flex justify-center"
                        >
                          {project.templateId === "memory_lane" ? (
                            /* Polaroid Frame */
                            <div className="bg-[#faf5ec] border border-[#d8ccb0] p-4 pb-8 shadow-xl transform rotate-1 w-full max-w-sm sm:max-w-md rounded-sm">
                              <div className="aspect-[4/3] w-full bg-zinc-950 overflow-hidden mb-4 relative shadow-inner">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover grayscale-[10%]" />
                              </div>
                              <p className="font-dancing text-lg text-[#2b221a] text-center min-h-[28px] font-semibold italic">
                                {project.photos[photoIndex].caption || "A beautiful memory."}
                              </p>
                            </div>
                          ) : project.templateId === "neon_party" ? (
                            /* Neon Cyber Frame */
                            <div className="bg-[#09090e]/80 border-2 border-pink-500/80 shadow-[0_0_20px_rgba(255,0,127,0.25)] p-4 w-full max-w-sm sm:max-w-md rounded-2xl">
                              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 border border-cyan-500/30">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-white text-xs font-semibold uppercase tracking-wider glow-text text-center font-poppins">
                                {project.photos[photoIndex].caption || "MOMENT"}
                              </p>
                            </div>
                          ) : project.templateId === "minimal_love" ? (
                            /* Minimalist spacing Frame */
                            <div className="bg-white border border-[#e8dfcf] p-2 shadow-sm w-full max-w-sm sm:max-w-md">
                              <div className="w-full aspect-[4/3] bg-zinc-100 overflow-hidden p-1">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-zinc-650 text-xs italic tracking-wider text-center mt-3 font-serif min-h-[20px]">
                                {project.photos[photoIndex].caption || "Where time stands still."}
                              </p>
                            </div>
                          ) : project.templateId === "golden_glimmer" ? (
                            /* Emerald & Gold Gilded */
                            <div className="bg-[#021c15]/60 border border-[#b89765] rounded-xl p-3 shadow-[0_4px_25px_rgba(184,151,101,0.15)] w-full max-w-sm sm:max-w-md">
                              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden mb-3 border border-[#b89765]/20">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[#f7f2eb] text-xs font-serif text-center italic font-light tracking-wide min-h-[20px] bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] bg-clip-text text-transparent">
                                {project.photos[photoIndex].caption || "A golden memory."}
                              </p>
                            </div>
                          ) : project.templateId === "retro_pop" ? (
                            /* Retro Pop blocky Polaroid */
                            <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm sm:max-w-md rounded-none">
                              <div className="aspect-square w-full bg-zinc-100 border-2 border-black overflow-hidden mb-3">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="font-sans font-black text-xs text-zinc-900 tracking-wide text-center uppercase">
                                {project.photos[photoIndex].caption || "MEMORABLE DAY"}
                              </p>
                            </div>
                          ) : project.templateId === "cyber_punk" ? (
                            /* Monospace Cyber hacker Frame */
                            <div className="border border-[#00ff66] bg-black/90 p-3 shadow-[0_0_15px_rgba(0,255,102,0.2)] w-full max-w-sm sm:max-w-md font-mono">
                              <div className="aspect-[4/3] w-full bg-zinc-950 overflow-hidden mb-2 border border-[#00ff66]/20">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover grayscale brightness-95" />
                              </div>
                              <p className="text-[#00ff66] font-mono text-[10px] text-center tracking-wider uppercase">
                                &gt; {project.photos[photoIndex].caption || "SYS_MOMENT_OK"}
                              </p>
                            </div>
                          ) : project.templateId === "sweet_sakura" ? (
                            /* Cherry blossom soft pink frame */
                            <div className="bg-white border border-pink-200/50 p-4 pb-6 shadow-[0_8px_25px_rgba(255,182,193,0.2)] w-full max-w-sm sm:max-w-md rounded-3xl">
                              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 border border-pink-100/50">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="font-serif italic text-pink-600 text-xs sm:text-sm text-center">
                                ✿ {project.photos[photoIndex].caption || "Blooming with memories."}
                              </p>
                            </div>
                          ) : project.templateId === "midnight_forest" ? (
                            /* Forest deep emerald frame */
                            <div className="bg-[#02170d]/80 border border-emerald-950 p-3 shadow-[0_0_20px_rgba(2,23,13,0.4)] w-full max-w-sm sm:max-w-md rounded-xl">
                              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden mb-3 border border-emerald-900/20">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover brightness-95" />
                              </div>
                              <p className="font-sans font-light text-xxs sm:text-xs text-[#ffd700] text-center tracking-wider uppercase">
                                🌲 {project.photos[photoIndex].caption || "Deep in the forest of memories."}
                              </p>
                            </div>
                          ) : project.templateId === "galactic_odyssey" ? (
                            /* Nebula spacesuit border */
                            <div className="bg-[#060818]/90 border border-cyan-500/30 p-3 shadow-[0_0_25px_rgba(6,182,212,0.25)] w-full max-w-sm sm:max-w-md rounded-sm font-mono">
                              <div className="aspect-[4/3] w-full bg-black overflow-hidden mb-3 relative">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-450 text-[8px] text-cyan-300">
                                  MOMENT_CAPSULE
                                </div>
                              </div>
                              <p className="text-cyan-400 text-[10px] tracking-widest text-center uppercase">
                                // {project.photos[photoIndex].caption || "STARDUST SEQUENCE"}
                              </p>
                            </div>
                          ) : project.templateId === "sunset_boulevard" ? (
                            /* Synthwave Sunset grid border */
                            <div className="bg-black/85 border-2 border-pink-500 shadow-[0_0_20px_#ff007f] p-4 w-full max-w-sm sm:max-w-md rounded-none">
                              <div className="aspect-[4/3] w-full bg-zinc-950 overflow-hidden mb-3 border-b-2 border-pink-500">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover animate-pulse" style={{ animationDuration: "3s" }} />
                              </div>
                              <p className="text-yellow-300 font-sans font-black tracking-wide text-xs sm:text-sm text-center uppercase italic">
                                🌴 {project.photos[photoIndex].caption || "WILD SUNSET"}
                              </p>
                            </div>
                          ) : project.templateId === "royal_velvet" ? (
                            /* Blue Royal Gold gilded frame */
                            <div className="bg-[#031535]/90 border-2 border-amber-500 shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-4 rounded-2xl w-full max-w-sm sm:max-w-md">
                              <div className="aspect-[4/3] w-full rounded-xl border border-amber-500/20 overflow-hidden mb-3">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[#ffd700] text-xs font-serif font-semibold text-center uppercase tracking-widest">
                                ✦ {project.photos[photoIndex].caption || "MEMORIA REGALIA"} ✦
                              </p>
                            </div>
                          ) : project.templateId === "ocean_breeze" ? (
                            /* Sandy shore teal border */
                            <div className="bg-[#f0f8ff] border border-teal-200 p-4 shadow-[0_4px_15px_rgba(0,128,128,0.1)] w-full max-w-sm sm:max-w-md rounded-2xl">
                              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-3">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-teal-900 font-serif italic text-xs sm:text-sm text-center">
                                🌊 {project.photos[photoIndex].caption || "Drifting on ocean waves."}
                              </p>
                            </div>
                          ) : project.templateId === "disco_fever" ? (
                            /* Disco ball colorful border */
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-xl w-full max-w-sm sm:max-w-md rounded-3xl">
                              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 border border-white/10">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover animate-pulse" />
                              </div>
                              <p className="text-[#ffff00] font-sans font-black tracking-tight text-xs sm:text-sm text-center uppercase">
                                🕺 {project.photos[photoIndex].caption || "DANCE THE NIGHT AWAY"}
                              </p>
                            </div>
                          ) : project.templateId === "chalkboard_memories" ? (
                            /* Blackboard outline sketch */
                            <div className="bg-[#1c2321] border-2 border-dashed border-zinc-500 p-4 shadow-md w-full max-w-sm sm:max-w-md rounded-sm">
                              <div className="aspect-[4/3] w-full bg-zinc-950 overflow-hidden mb-3 border border-zinc-700">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover grayscale brightness-95" />
                              </div>
                              <p className="text-zinc-300 font-serif text-xs text-center border-t border-zinc-800/80 pt-3">
                                ✎ {project.photos[photoIndex].caption || "Written in chalk."}
                              </p>
                            </div>
                          ) : project.templateId === "comic_pop" ? (
                            /* Pop Art comic polaroid */
                            <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-sm sm:max-w-md transform rotate-1 rounded-none">
                              <div className="aspect-square w-full bg-zinc-100 border-2 border-black overflow-hidden mb-3 relative">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 right-2 bg-yellow-400 border border-black text-[9px] font-black text-black px-2 py-0.5 uppercase tracking-wide">
                                  KAPOW!
                                </div>
                              </div>
                              <p className="text-black font-extrabold font-sans text-xs text-center tracking-tight uppercase">
                                {project.photos[photoIndex].caption || "POW! AMAZING MOMENT!"}
                              </p>
                            </div>
                          ) : project.templateId === "dreamy_clouds" ? (
                            /* Lavender sky border */
                            <div className="bg-white/60 border border-white/30 shadow-[0_10px_30px_rgba(163,201,255,0.2)] p-4 rounded-3xl w-full max-w-sm sm:max-w-md">
                              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 border border-white/20">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-indigo-950 font-serif italic text-xs sm:text-sm text-center">
                                ☁ {project.photos[photoIndex].caption || "Floating on cloud nine."}
                              </p>
                            </div>
                          ) : (
                            /* Classic Stage Spotlight Frame */
                            <div className="bg-gradient-to-b from-[#2a0a0f] to-[#120305] border-2 border-[#d4af37] shadow-[0_15px_50px_rgba(0,0,0,0.85),_0_0_25px_rgba(212,175,55,0.25)] p-4 rounded-3xl w-full max-w-sm sm:max-w-md relative overflow-hidden">
                              <div className="absolute inset-0 bg-radial-gradient from-yellow-500/5 to-transparent pointer-events-none" />
                              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 border border-[#d4af37]/30 shadow-inner">
                                <img src={project.photos[photoIndex].url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[#faf0d0] text-xs sm:text-sm font-serif italic text-center leading-relaxed min-h-[30px] font-medium tracking-wide">
                                {project.photos[photoIndex].caption || "A theatrical memory fragment."}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Progress dots indicator */}
                  <div className="flex justify-center gap-1.5 pb-2">
                    {project.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === photoIndex ? "w-6 bg-purple-500" : "w-1.5 bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation controls in footer */}
                  <div className="flex justify-between pt-4 border-t border-white/5 z-20">
                    <button
                      onClick={() => setSlideIndex(1)}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={12} />
                      View Message
                    </button>
                    <button
                      onClick={() => setSlideIndex(3)}
                      className={`flex items-center gap-1 py-2 px-4 rounded-xl font-medium text-[10px] cursor-pointer transition-transform hover:scale-[1.02] ${theme.btnClass}`}
                    >
                      Unwrap Gift
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SLIDE 3: CELEBRATION */}
          {slideIndex === 3 && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="text-center flex flex-col items-center max-w-xl mx-auto"
            >
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.3, duration: 0.8 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(236,72,153,0.3)]"
              >
                <Gift size={32} className="animate-bounce" />
              </motion.div>

              <span className="text-[10px] tracking-widest font-mono uppercase opacity-55 block mb-3">
                — CELEBRATING LIFE
              </span>

              <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide leading-tight mb-4">
                Happy {project.age}th Birthday, <span className={`${theme.accentText}`}>{project.recipientName}</span>!
              </h1>

              <p className="text-sm text-zinc-400 font-light mb-10 max-w-sm leading-relaxed">
                May your day be filled with all the light, laughter, and magic that you bring to those around you.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    setPhotoIndex(0);
                    setSlideIndex(2);
                  }}
                  className="flex items-center gap-1.5 py-3.5 px-6 rounded-full border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  <RotateCcw size={14} />
                  Replay Experience
                </button>

                <a
                  href={project.creatorPhone 
                    ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(project.creatorPhone)}&text=${encodeURIComponent("Hey ❤️ Thank you so much for this beautiful birthday surprise! It made my day ✨")}`
                    : `https://api.whatsapp.com/send?text=${encodeURIComponent("Hey ❤️ Thank you so much for this beautiful memory experience! It made my day ✨")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 py-3.5 px-6 rounded-full font-medium text-xs transition-transform hover:scale-105 cursor-pointer ${theme.btnClass}`}
                >
                  <MessageCircle size={14} />
                  Say Thank You!
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Red Velvet Curtains Overlay for Classic Theme */}
      {project.templateId === "classic" && (slideIndex === 0 || slideIndex === 1 || slideIndex === 2 || slideIndex === 3) && (
        <>
          <div className={`curtain-panel curtain-left ${curtainsOpen ? "open" : ""}`} />
          <div className={`curtain-panel curtain-right ${curtainsOpen ? "open" : ""}`} />
        </>
      )}

      {/* Hanging Fairy Lights for Classic Theme */}
      {project.templateId === "classic" && (slideIndex === 0 || slideIndex === 1 || slideIndex === 2 || slideIndex === 3) && (
        <div className="absolute top-0 left-0 w-full h-[100px] pointer-events-none z-30 overflow-hidden">
          <svg className="w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 1000 100">
            <path d="M0,15 Q125,50 250,15 T500,15 T750,15 T1000,15" fill="none" stroke="#222" strokeWidth="2" />
          </svg>
          {Array.from({ length: 18 }).map((_, i) => {
            const leftPercent = (i / 17) * 100;
            const droop = Math.sin((i / 17) * Math.PI * 3.4);
            const topOffset = 15 + Math.abs(droop) * 20;
            const animDelay = `${(i % 3) * 0.4}s`;
            return (
              <div
                key={i}
                className="bulb-teardrop"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topOffset}px`,
                  animationDelay: animDelay,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Floating Balloons */}
      {balloons.map((b) => (
        <div
          key={b.id}
          className="balloon"
          style={{
            left: `${b.left}vw`,
            background: `radial-gradient(circle at 70% 30%, ${b.color1}, ${b.color2})`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <div className="balloon-shine" />
        </div>
      ))}

      {/* Footer Branding */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-center opacity-40 z-10 relative">
        <span className="text-[9px] font-mono tracking-widest uppercase">
          Curated with Memora
        </span>
      </footer>

      {/* Global CSS Styles for Balloons & Fairy Lights & Curtains */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes balloonFloat {
          0% {
            transform: translateY(110vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotate(15deg);
            opacity: 0;
          }
        }
        .balloon {
          position: fixed;
          bottom: -120px;
          width: 55px;
          height: 72px;
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          z-index: 40;
          animation: balloonFloat 8s linear infinite;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .balloon::before {
          content: '';
          position: absolute;
          bottom: -4px;
          width: 8px;
          height: 5px;
          background: inherit;
          border-radius: 50%;
        }
        .balloon::after {
          content: '';
          position: absolute;
          bottom: -50px;
          width: 1px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
        }
        .balloon-shine {
          position: absolute;
          top: 15%;
          left: 15%;
          width: 12px;
          height: 20px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          filter: blur(1px);
          transform: rotate(30deg);
        }
        
        @keyframes bulbFlicker {
          0%, 100% {
            opacity: 0.4;
            box-shadow: 0 0 4px rgba(255, 222, 107, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 15px rgba(255, 222, 107, 0.95), 0 0 25px rgba(255, 222, 107, 0.7);
          }
        }
        .bulb-teardrop {
          position: absolute;
          width: 12px;
          height: 18px;
          border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
          background: radial-gradient(circle at 30% 30%, #fff, #ffde6b 60%, #b8860b);
          transform: translate(-50%, 0);
          animation: bulbFlicker 1.8s infinite alternate;
        }

        .curtain-panel {
          position: fixed;
          top: 0;
          width: 51%;
          height: 100%;
          background: repeating-linear-gradient(to right, #500004, #2a0002 8%, #400003 15%);
          z-index: 45;
          transition: transform 2.2s cubic-bezier(0.77, 0, 0.175, 1);
          box-shadow: inset 0 0 80px rgba(0,0,0,0.9);
          pointer-events: none;
        }
        .curtain-left {
          left: 0;
          border-right: 4px solid #d4af37;
          transform-origin: left;
        }
        .curtain-right {
          right: 0;
          border-left: 4px solid #d4af37;
          transform-origin: right;
        }
        .curtain-left.open {
          transform: translateX(-100%) skewY(-6deg);
        }
        .curtain-right.open {
          transform: translateX(100%) skewY(6deg);
        }

        /* Cosmic Drift for Luxury */
        @keyframes cosmicDrift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(5vw, 5vh) scale(1.15);
          }
        }
        .animate-cosmic-drift {
          animation: cosmicDrift 20s ease-in-out infinite alternate;
        }

        /* Neon Flare for Cyber/Neon */
        @keyframes neonFlare {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-3vw, 4vh) scale(1.1);
            opacity: 0.6;
          }
        }
        .animate-neon-flare {
          animation: neonFlare 15s ease-in-out infinite alternate;
        }

        /* Spotlight Sweep for Classic Stage */
        @keyframes spotlightSweep {
          0%, 100% {
            transform: translateX(-50%) rotate(-4deg);
          }
          50% {
            transform: translateX(-50%) rotate(4deg);
          }
        }
        .animate-spotlight-sweep {
          animation: spotlightSweep 8s ease-in-out infinite alternate;
        }

        /* Gold Dust Drift */
        @keyframes goldDrift {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 100px 200px;
          }
        }
        .animate-gold-drift {
          animation: goldDrift 30s linear infinite;
        }

        /* Old Film Flicker */
        @keyframes filmFlicker {
          0%, 100% {
            opacity: 0.08;
          }
          10% {
            opacity: 0.14;
          }
          30% {
            opacity: 0.11;
          }
          50% {
            opacity: 0.15;
          }
          70% {
            opacity: 0.09;
          }
          90% {
            opacity: 0.13;
          }
        }
        .animate-film-flicker {
          animation: filmFlicker 0.25s steps(2) infinite;
        }

        /* Glimmer Sparkle Pulses */
        @keyframes glimmerPulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.9;
          }
        }
        .animate-glimmer-pulse {
          animation: glimmerPulse 3s ease-in-out infinite;
        }
      `}} />

    </div>
  );
}
