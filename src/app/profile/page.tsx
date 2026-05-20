"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getProjectsByOwner, MemoraProject, updateMemoraUser } from "@/lib/firebase";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  ArrowLeft, User, Mail, Calendar, Sparkles, LogOut, 
  CheckCircle, Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const { t, currentLang } = useTranslation();
  const router = useRouter();

  const [projects, setProjects] = useState<MemoraProject[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      if (user) {
        try {
          const data = await getProjectsByOwner(user.uid);
          setProjects(data);
        } catch (err) {
          console.error("Failed to load user projects:", err);
        } finally {
          setLoadingStats(false);
        }
      }
    };
    fetchStats();
  }, [user, loading, router]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="font-poppins text-sm text-zinc-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.published).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalPhotos = projects.reduce((acc, p) => acc + (p.photos?.length || 0), 0);



  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-poppins relative pb-20 selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Sleek Cinematic Radiant Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-indigo-950/8 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10 relative z-10">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-semibold uppercase tracking-wider group"
          >
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            {t("backToDashboard")}
          </Link>
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 py-1.5 px-3 rounded-full">
            <Sparkles size={11} className="animate-spin-slow" />
            {t("userSettings")}
          </span>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* User Details Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 glass-panel rounded-3xl p-6 border border-zinc-850 flex flex-col items-center text-center justify-between h-[360px] relative overflow-hidden group shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="w-full flex flex-col items-center relative z-10">
              <div className="w-24 h-24 rounded-full border-2 border-purple-500/20 p-1 overflow-hidden mb-5 bg-zinc-950/60 shadow-inner flex items-center justify-center relative group-hover:border-purple-500/40 transition-colors duration-500">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User size={38} className="text-zinc-600" />
                )}
              </div>
              <h2 className="text-lg font-medium text-white tracking-wide">{user.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={11} className="text-zinc-500" />
                <p className="text-xs text-zinc-500 font-light select-all">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="relative z-10 mt-8 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-950/20 hover:bg-red-600/90 border border-red-950/40 hover:border-red-500 transition-all duration-300 shadow-md cursor-pointer hover:shadow-red-500/10"
            >
              <LogOut size={13} />
              {t("logoutAccount")}
            </button>
          </motion.div>

          {/* Account Settings & Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="md:col-span-2 space-y-6"
          >
            
            {/* Account Overview Stats */}
            <div className="glass-panel rounded-3xl p-8 border border-zinc-850 shadow-lg">
              <h3 className="text-xl font-serif text-white tracking-wide mb-6">{t("accountOverview")}</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-950/40 border border-zinc-900/60 p-5 rounded-2xl text-center hover:border-zinc-800/80 transition-colors">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">TOTAL</span>
                  <span className="text-3xl font-light text-white font-serif">{loadingStats ? "..." : totalProjects}</span>
                  <span className="text-[9px] text-zinc-400 font-light block mt-1.5">{t("totalExperiences").split(" ")[1]}</span>
                </div>
                
                <div className="bg-zinc-950/40 border border-zinc-900/60 p-5 rounded-2xl text-center hover:border-emerald-500/10 transition-colors">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">LIVE</span>
                  <span className="text-3xl font-light text-emerald-400 font-serif">{loadingStats ? "..." : publishedProjects}</span>
                  <span className="text-[9px] text-zinc-400 font-light block mt-1.5">{t("published")}</span>
                </div>
                
                <div className="bg-zinc-950/40 border border-zinc-900/60 p-5 rounded-2xl text-center hover:border-purple-500/10 transition-colors">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">EDITING</span>
                  <span className="text-3xl font-light text-purple-400 font-serif">{loadingStats ? "..." : draftProjects}</span>
                  <span className="text-[9px] text-zinc-400 font-light block mt-1.5">{t("drafts")}</span>
                </div>
              </div>
            </div>



            {/* Plan and Security Section */}
            <div className="glass-panel rounded-3xl p-8 border border-zinc-850 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <Shield size={14} className="text-purple-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">{t("securityPlan")}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/60 text-xs">
                  <span className="text-zinc-500">{t("planTier")}</span>
                  <span className="font-semibold text-purple-400 font-mono flex items-center gap-1">
                    <Sparkles size={11} className="animate-pulse" />
                    MEMORA PREVIEW
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/60 text-xs">
                  <span className="text-zinc-500">{t("accountJoined")}</span>
                  <span className="text-zinc-300 font-mono">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span className="text-zinc-500">{t("storageUsage")}</span>
                  <span className="text-zinc-300 font-mono">
                    {totalPhotos > 0 ? `${(totalPhotos * 0.4).toFixed(1)} MB` : "0 MB"} of 50 MB
                  </span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
