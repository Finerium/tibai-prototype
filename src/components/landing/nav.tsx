"use client";

import Link from "next/link";
import { useLang } from "./lang";
import type { NavState } from "./use-landing-motion";

export function Nav({ scrolled, onDark }: NavState) {
  const { lang, setLang, t } = useLang();
  const cls = "nav" + (scrolled ? " scrolled" : "") + (onDark ? " on-dark-nav" : "");

  return (
    <header className={cls} id="nav">
      <a className="brand" href="#top" aria-label="Tiba">
        Tib<span className="ai">AI</span>
      </a>
      <nav className="nav-right" aria-label="Utama">
        <div className="nav-links">
          <a href="#problem">{t("Masalah", "Problem")}</a>
          <a href="#thesis">{t("Tesis", "Thesis")}</a>
          <a href="#how">{t("Cara kerja", "How it works")}</a>
          <a href="#dishub">{t("Untuk DISHUB", "For DISHUB")}</a>
          <a href="#credibility">{t("Kredibilitas", "Credibility")}</a>
        </div>
        <div className="lang" role="group" aria-label="Bahasa / Language">
          <button type="button" aria-pressed={lang === "id"} onClick={() => setLang("id")}>
            ID
          </button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
        </div>
        <Link className="btn-pilot" href="/login">
          {t("Ajukan pilot", "Request a pilot")}
        </Link>
      </nav>
    </header>
  );
}
