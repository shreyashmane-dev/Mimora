"use client";

import { useCallback } from "react";
import { TRANSLATIONS, TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const currentLang = "en" as const;
  
  const t = useCallback((key: TranslationKey): string => {
    return (TRANSLATIONS[key] || key) as string;
  }, []);

  return { t, currentLang };
}
