"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getProjectsByOwner, MemoraProject } from "@/lib/firebase";
import { ArrowLeft, User, Mail, Calendar, Eye, EyeOff, Sparkles, LogOut, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<MemoraProject[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

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

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="font-poppins text-sm text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.published).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalPhotos = projects.reduce((acc, p) => acc + (p.photos?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-poppins relative pb-16">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-900/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={12} />
            USER SETTINGS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User detail card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 glass-panel rounded-3xl p-6 border border-zinc-850 flex flex-col items-center text-center justify-between"
          >
            <div className="w-full flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-2 border-purple-500/20 overflow-hidden mb-4 bg-zinc-900 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-zinc-650" />
                )}
              </div>
              <h2 className="text-lg font-medium text-white tracking-wide">{user.name}</h2>
              <p className="text-xs text-zinc-500 font-light mt-0.5 select-all">{user.email}</p>
            </div>

            <button
              onClick={logout}
              className="mt-8 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-medium text-red-400 hover:text-white bg-red-950/20 hover:bg-red-600 border border-red-900/30 hover:border-red-500 transition-all duration-300 cursor-pointer"
            >
              <LogOut size={14} />
              Logout Account
            </button>
          </motion.div>

          {/* Account statistics */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="glass-panel rounded-3xl p-8 border border-zinc-850">
              <h3 className="text-xl font-serif text-white tracking-wide mb-6">Account Overview</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">TOTAL</span>
                  <span className="text-3xl font-light text-white font-serif">{loadingStats ? "..." : totalProjects}</span>
                  <span className="text-[9px] text-zinc-400 font-light block mt-1.5">Experiences</span>
                </div>
                
                <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">PUBLISHED</span>
                  <span className="text-3xl font-light text-emerald-400 font-serif">{loadingStats ? "..." : publishedProjects}</span>
                  <span className="text-[9px] text-zinc-400 font-light block mt-1.5">Live Sites</span>
                </div>
                
                <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">DRAFTS</span>
                  <span className="text-3xl font-light text-purple-400 font-serif">{loadingStats ? "..." : draftProjects}</span>
                  <span className="text-[9px] text-zinc-400 font-light block mt-1.5">Editing</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-zinc-850">
              <h3 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-4">Security & Plan</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/60 text-xs">
                  <span className="text-zinc-500">Plan Tier</span>
                  <span className="font-semibold text-purple-400 font-mono flex items-center gap-1">
                    <Sparkles size={11} />
                    MEMORA PREVIEW
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900/60 text-xs">
                  <span className="text-zinc-500">Account Joined</span>
                  <span className="text-zinc-300 font-mono">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span className="text-zinc-500">Storage Usage</span>
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
