"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export interface NavState {
  scrolled: boolean;
  onDark: boolean;
}

/**
 * Landing motion orchestration: Lenis smooth scroll synced to the GSAP ticker,
 * nav scroll/dark-section state, and smooth-scroll anchor navigation. Under
 * prefers-reduced-motion, Lenis is skipped entirely (native scroll) and anchors
 * jump without tweening.
 */
export function useLandingMotion(onNavState: (s: NavState) => void) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const computeNav = (scrollY: number) => {
      const scrolled = scrollY > 40;
      let onDark = false;
      document.querySelectorAll(".problem, .cta, .footer").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= 64 && r.bottom >= 64) onDark = true;
      });
      onNavState({ scrolled, onDark });
    };

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let onWindowScroll: (() => void) | null = null;

    if (!reduce) {
      const l = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis = l;
      l.on("scroll", () => {
        ScrollTrigger.update();
        computeNav(l.scroll);
      });
      tickerFn = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    } else {
      onWindowScroll = () => computeNav(window.scrollY);
      window.addEventListener("scroll", onWindowScroll, { passive: true });
    }

    computeNav(window.scrollY || 0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href") || "";
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -70, duration: 1.1 });
      else (target as HTMLElement).scrollIntoView({ block: "start" });
    };
    document.addEventListener("click", onClick);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", onLoad);
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (onWindowScroll) window.removeEventListener("scroll", onWindowScroll);
      lenis?.destroy();
    };
  }, [onNavState]);
}
