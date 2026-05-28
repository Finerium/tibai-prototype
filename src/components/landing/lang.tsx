"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** pick a string by current language */
  t: (id: string, en: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = "tiba-lang";

/**
 * Bilingual context for the landing surface. English is the default on first
 * visit (per the brief). The toggle updates state and writes the choice to
 * localStorage; the server-rendered default stays English so there is no
 * hydration mismatch.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (id: string, en: string) => (lang === "en" ? en : id);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLang must be used within LanguageProvider");
  return c;
}
