"use client";

import { useCallback, useState } from "react";
import { LanguageProvider, useLang } from "./lang";
import { Nav } from "./nav";
import { Hero, Problem, Thesis, How, Dishub, Credibility, Cta } from "./sections";
import { useLandingMotion, type NavState } from "./use-landing-motion";

function LandingInner() {
  const { t } = useLang();
  const [nav, setNav] = useState<NavState>({ scrolled: false, onDark: false });

  // only re-render when the derived booleans actually flip (avoids per-frame churn)
  const onNavState = useCallback((s: NavState) => {
    setNav((prev) => (prev.scrolled === s.scrolled && prev.onDark === s.onDark ? prev : s));
  }, []);

  useLandingMotion(onNavState);

  return (
    <div className="tiba-landing">
      <a className="skip" href="#main">
        {t("Lewati ke konten", "Skip to content")}
      </a>
      <Nav scrolled={nav.scrolled} onDark={nav.onDark} />
      <main id="main">
        <span id="top" />
        <Hero />
        <Problem />
        <Thesis />
        <How />
        <Dishub />
        <Credibility />
        <Cta />
      </main>
    </div>
  );
}

export function LandingPage() {
  return (
    <LanguageProvider>
      <LandingInner />
    </LanguageProvider>
  );
}
