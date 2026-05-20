"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MemoraUser, getAuthStatus, logOut } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: MemoraUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MemoraUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = () => setTick(t => t + 1);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getAuthStatus((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [tick]);

  // Protect Dashboard & Creation Routes
  useEffect(() => {
    if (!loading) {
      const protectedPaths = ["/dashboard", "/create", "/project", "/profile"];
      const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
      
      if (isProtected && !user) {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logOut();
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout: handleLogout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
