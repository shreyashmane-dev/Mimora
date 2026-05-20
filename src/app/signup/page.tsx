"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { emailSignUp, signInWithGoogle } from "@/lib/firebase";
import { Sparkles, Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await emailSignUp(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="font-poppins text-sm text-zinc-400">Entering Memora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#030303]">
      {/* Background blur effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-glow [animation-delay:4s]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} className="text-purple-100" />
            </div>
            <span className="font-poppins font-semibold text-2xl tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Memora
            </span>
          </Link>
          <p className="mt-3 text-zinc-400 font-poppins text-sm font-light">
            Start creating cinematic experiences today.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-poppins">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-poppins font-medium text-zinc-400 mb-2 tracking-wider uppercase">
                Your Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-poppins text-white bg-zinc-900/50 border border-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-poppins font-medium text-zinc-400 mb-2 tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-poppins text-white bg-zinc-900/50 border border-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-poppins font-medium text-zinc-400 mb-2 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-poppins text-white bg-zinc-900/50 border border-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-poppins font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(168,85,247,0.25)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all duration-300 cursor-pointer"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <span className="relative px-3 text-xs bg-[#0b0b12] text-zinc-500 font-poppins">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Social login */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-poppins text-zinc-300 hover:text-white bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs font-poppins text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
