"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getProjectsByOwner, MemoraProject, saveProject } from "@/lib/firebase";
import { checkAndCleanupExpiredProjects } from "@/app/actions/theme";
import { deleteProjectWithAssets } from "@/app/actions/project";
import { 
  Plus, Search, Sparkles, LogOut, Trash2, Edit, ExternalLink, 
  Share2, Calendar, Music, Layout, User as UserIcon, Copy, Check, MessageCircle, X
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { t, currentLang } = useTranslation();
  const router = useRouter();

  const [projects, setProjects] = useState<MemoraProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingProject, setSharingProject] = useState<MemoraProject | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch projects once user is loaded
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchProjects = async () => {
      if (user) {
        setLoadingProjects(true);
        try {
          const data = await getProjectsByOwner(user.uid);
          setProjects(data);
        } catch (err) {
          console.error("Error fetching projects:", err);
        } finally {
          setLoadingProjects(false);
        }
      }
    };

    fetchProjects();

    // Scan and clean up photos older than 45 days in the background
    checkAndCleanupExpiredProjects()
      .then((res) => {
        if (res.success && res.cleanedCount > 0) {
          console.log(`Cleaned up ${res.cleanedCount} expired project photos.`);
          fetchProjects();
        }
      })
      .catch((e) => console.error("Failed to auto-expire photos:", e));
  }, [user, loading, router]);

  const handleDelete = async (id: string) => {
    if (confirm(t("deleteConfirm"))) {
      try {
        const result = await deleteProjectWithAssets(id);
        if (result.success) {
          setProjects(projects.filter(p => p.id !== id));
        } else {
          alert(`Failed to delete project: ${result.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Failed to delete project:", err);
        alert("Failed to delete project. Check console logs.");
      }
    }
  };

  const togglePublish = async (project: MemoraProject) => {
    try {
      const updated = { ...project, published: !project.published };
      await saveProject(updated);
      setProjects(projects.map(p => p.id === project.id ? updated : p));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getShareUrl = (slug: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/preview/${slug}`;
  };

  const handleCopyLink = (slug: string) => {
    const url = getShareUrl(slug);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppLink = (slug: string, recipientName: string) => {
    const url = getShareUrl(slug);
    const text = `Hey ✨\nI made something special for your birthday ❤️\nOpen this:\n${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Filter projects by recipient name
  const filteredProjects = projects.filter((p) =>
    p.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nickname && p.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

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

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-poppins relative pb-16">
      {/* Background glow sparks */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        {/* Navigation / Header */}
        <header className="flex items-center justify-between pb-8 border-b border-zinc-900 mb-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-300">
                <Sparkles size={18} />
              </div>
              <span className="font-poppins font-semibold text-xl tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Memora
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-900 text-sm font-medium"
            >
              <UserIcon size={16} />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-900/60 text-sm font-medium cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </header>

        {/* Dashboard Title & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">
              {t("dashboardTitle")}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-light">
              {t("dashboardSubtitle")}
            </p>
          </div>

          <Link
            href="/create"
            className="self-start md:self-auto flex items-center gap-2 py-3 px-5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(168,85,247,0.2)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={16} />
            {t("createExperienceBtn")}
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white bg-zinc-900/30 border border-zinc-800/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
          />
        </div>

        {/* Projects Grid */}
        {loadingProjects ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto border border-zinc-800/40">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{t("noCardsTitle")}</h3>
            <p className="text-sm text-zinc-400 font-light mb-6">
              {searchQuery ? "No matches for your search query. Try another name." : t("noCardsDesc")}
            </p>
            {!searchQuery && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer"
              >
                <Plus size={16} />
                {t("createExperienceBtn")}
              </Link>
            )}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="glass-panel rounded-2xl relative overflow-hidden flex flex-col group hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Header Gradient based on template */}
                <div className={`h-2.5 w-full bg-gradient-to-r ${
                  project.templateId === "midnight_luxury" ? "from-purple-800 to-indigo-900" :
                  project.templateId === "memory_lane" ? "from-amber-600 to-amber-800" :
                  project.templateId === "neon_party" ? "from-pink-500 to-cyan-500" :
                  project.templateId === "minimal_love" ? "from-amber-200 to-yellow-500" :
                  project.templateId === "golden_glimmer" ? "from-[#d4af37] via-[#aa7c11] to-[#6d4c06]" :
                  project.templateId === "retro_pop" ? "from-[#ff3e6c] to-yellow-400" :
                  "from-[#00ff66] to-[#00aa33]"
                }`} />

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium text-white tracking-wide truncate max-w-[200px]">
                          {project.recipientName}
                        </h3>
                        {project.nickname && (
                          <span className="text-xs text-purple-400 font-light font-poppins">
                            &quot;{project.nickname}&quot;
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => togglePublish(project)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors border cursor-pointer ${
                          project.published 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-zinc-800 text-zinc-400 border-zinc-700/60"
                        }`}
                      >
                        {project.published ? t("published") : t("drafts")}
                      </button>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Calendar size={14} className="text-zinc-500" />
                        <span>Age {project.age} • {project.relationship}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Layout size={14} className="text-zinc-500" />
                        <span className="capitalize">{project.templateId.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Music size={14} className="text-zinc-500" />
                        <span className="capitalize">{project.music.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-900/60">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/project/${project.id}`}
                        className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        title={t("editCard")}
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 rounded-lg bg-zinc-900/80 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title={t("deleteCard")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {project.published && (
                        <button
                          onClick={() => setSharingProject(project)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 border border-purple-900/30 hover:border-purple-800/40 text-xs font-medium transition-all cursor-pointer"
                        >
                          <Share2 size={13} />
                          &quot;Share&quot;
                        </button>
                      )}
                      
                      <Link
                        href={`/preview/${project.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all"
                      >
                        <ExternalLink size={13} />
                        &quot;Preview&quot;
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Share Overlay Modal */}
      <AnimatePresence>
        {sharingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md rounded-2xl p-6 relative overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <button 
                onClick={() => setSharingProject(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>

              <h2 className="text-xl font-medium text-white mb-1">
                &quot;Share Experience&quot;
              </h2>
              <p className="text-xs text-zinc-400 font-light mb-6">
                {t("shareDesc")} {sharingProject.recipientName}.
              </p>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-xl mb-6 w-36 h-36 mx-auto">
                <QRCodeSVG value={getShareUrl(sharingProject.slug)} size={112} />
              </div>

              {/* Copy URL */}
              <div className="mb-4">
                <label className="block text-xxs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                  &quot;Public Link&quot;
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl(sharingProject.slug)}
                    className="flex-grow bg-zinc-950/60 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-300 select-all"
                  />
                  <button
                    onClick={() => handleCopyLink(sharingProject.slug)}
                    className="flex items-center justify-center p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* WhatsApp Share */}
              <a
                href={getWhatsAppLink(sharingProject.slug, sharingProject.recipientName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium text-sm text-white transition-colors text-center"
              >
                <MessageCircle size={16} />
                {t("sendWhatsApp")}
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
