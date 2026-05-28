"use client";

import { useEffect, useId, useMemo, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease, lerp, smooth } from "./geometry";
import { useLang } from "./lang";

/** Run a diagram's play()/instant() lifecycle. instant() under reduced motion;
 *  play() once on scroll-in, or immediately on mount for the hero. */
function useDiagram(
  ref: React.RefObject<HTMLDivElement | null>,
  build: (root: HTMLDivElement) => { play: () => void; instant: () => void },
  onMount = false,
) {
  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { play, instant } = buildRef.current(root);
    if (reduce) {
      instant();
      return;
    }
    if (onMount) {
      const tl = gsap.delayedCall(0.5, play);
      return () => tl.kill();
    }
    const st = ScrollTrigger.create({ trigger: root, start: "top 80%", once: true, onEnter: play });
    return () => st.kill();
  }, [ref, onMount]);
}

function drawInit(path: SVGPathElement) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = String(len);
  return len;
}
function setDrawn(path: SVGPathElement) {
  path.style.strokeDasharray = "none";
  path.style.strokeDashoffset = "0";
}

/* ============ HERO probability band ============ */
export function HeroBand({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  const uid = useId().replace(/:/g, "");
  const clip = "clip" + uid;
  const grad = "grad" + uid;

  const geo = useMemo(() => {
    const L = 80, R = 1140, N = 60;
    const med: number[][] = [], up: number[][] = [], lo: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const tt = i / N;
      const x = lerp(L, R, tt);
      const my = 206 - 64 * ease(tt);
      const hw = 14 + (94 - 14) * Math.pow(1 - tt, 1.45);
      med.push([x, my]);
      up.push([x, my - hw]);
      lo.push([x, my + hw]);
    }
    const upD = smooth(up), loD = smooth(lo), medD = smooth(med);
    const bandD = upD + " L " + lo.slice().reverse().map((p) => p.join(" ")).join(" L ") + " Z";
    return { L, R, N, med, upD, loD, medD, bandD };
  }, []);

  const { L, R, N, med, upD, loD, medD, bandD } = geo;
  const last = med[N][1];
  const ry = { p90: last - 22, p50: last, p10: last + 26 };

  useDiagram(ref, (root) => {
    const q = <T extends Element>(s: string) => root.querySelector(s) as T;
    const rect = q<SVGRectElement>(".band-reveal-rect");
    const median = q<SVGPathElement>(".median-path");
    const naive = q<SVGPathElement>(".naive-path");
    const grid = q<SVGGElement>(".viz-grid");
    const marks = root.querySelectorAll<SVGTextElement>(".viz-markers text");
    const labels = root.querySelectorAll<SVGTextElement>(".viz-labels text");
    return {
      instant() {
        rect.setAttribute("width", "1200");
        setDrawn(median);
        gsap.set([Array.from(labels), Array.from(marks), grid], { opacity: 1 });
        gsap.set(naive, { opacity: 0.9 });
      },
      play() {
        drawInit(median);
        gsap.set(rect, { attr: { width: 0 } });
        gsap.set([Array.from(labels), Array.from(marks)], { opacity: 0 });
        gsap.set(grid, { opacity: 0 });
        gsap.set(naive, { opacity: 0 });
        const tl = gsap.timeline();
        tl.to(grid, { opacity: 1, duration: 0.6 }, 0)
          .to(naive, { opacity: 0.85, duration: 0.7 }, 0.1)
          .to(rect, { attr: { width: 1200 }, duration: 1.5, ease: "power3.inOut" }, 0.15)
          .to(median, { strokeDashoffset: 0, duration: 1.45, ease: "power3.inOut" }, 0.2)
          .to(Array.from(marks), { opacity: 1, duration: 0.5, stagger: 0.08 }, 0.6)
          .to(Array.from(labels), { opacity: 1, duration: 0.5, stagger: 0.07 }, 1.0);
      },
    };
  }, true);

  return (
    <div className="hero-viz" data-viz="hero" ref={ref}>
      <svg
        viewBox="0 0 1200 380"
        role="img"
        aria-label={t(
          "Prediksi kedatangan: rentang keyakinan P10 P50 P90 menyempit menjelang kedatangan",
          "Arrival prediction: the P10 P50 P90 confidence band narrows toward arrival",
        )}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={clip}>
            <rect className="band-reveal-rect" x="0" y="0" width="0" height="380" />
          </clipPath>
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <g className="viz-grid" stroke="var(--hairline)" strokeWidth="1">
          {[110, 170, 230, 290].map((y) => (
            <line key={y} x1={L} x2={R} y1={y} y2={y} />
          ))}
        </g>
        <g clipPath={`url(#${clip})`}>
          <path className="band-path" d={bandD} fill={`url(#${grad})`} stroke="none" />
          <path className="band-upper" d={upD} fill="none" stroke="var(--band-edge)" strokeWidth="1.25" strokeDasharray="2 4" />
          <path className="band-lower" d={loD} fill="none" stroke="var(--band-edge)" strokeWidth="1.25" strokeDasharray="2 4" />
        </g>
        <path className="naive-path" d={`M ${L} 232 L ${R} 150`} clipPath={`url(#${clip})`} fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="7 6" />
        <path className="median-path" d={medD} clipPath={`url(#${clip})`} fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
        <g className="viz-markers" fontFamily="var(--font-geist-mono), monospace" fontSize="15" fill="var(--ink-faint)">
          <line x1={L} y1="40" x2={L} y2="320" stroke="var(--hairline-2)" strokeWidth="1" />
          <line x1={R} y1="40" x2={R} y2="320" stroke="var(--accent)" strokeWidth="1.5" />
          <text x={L} y="346" textAnchor="start">{t("SEKARANG", "NOW")}</text>
          <text x={R} y="346" textAnchor="end" fill="var(--accent)">{t("TIBA", "ARRIVE")}</text>
        </g>
        <g className="viz-labels" fontFamily="var(--font-geist-mono), monospace" fontSize="15">
          <text x={R + 14} y={ry.p90} fill="var(--ink-faint)">P90</text>
          <text x={R + 14} y={ry.p50 + 5} fill="var(--accent)" fontWeight="500">P50</text>
          <text x={R + 14} y={ry.p10} fill="var(--ink-faint)">P10</text>
          <text x={L} y="232" dx="-2" textAnchor="end" fill="var(--ink-faint)" fontSize="13">ETA</text>
        </g>
      </svg>
      {children}
    </div>
  );
}

/* ============ pillar 01, mini band ============ */
export function PillarBand({ caption }: { caption?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { band, median } = useMemo(() => {
    const N = 36, base = 95;
    const med: number[][] = [], up: number[][] = [], lo: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const tt = i / N, x = lerp(20, 340, tt);
      const my = base - 26 * ease(tt);
      const hw = 6 + 40 * Math.pow(1 - tt, 1.5);
      med.push([x, my]);
      up.push([x, my - hw]);
      lo.push([x, my + hw]);
    }
    return {
      band: smooth(up) + " L " + lo.slice().reverse().map((p) => p.join(" ")).join(" L ") + " Z",
      median: smooth(med),
    };
  }, []);

  useDiagram(ref, (root) => {
    const bandEl = root.querySelector(".pb-band") as SVGPathElement;
    const medEl = root.querySelector(".pb-median") as SVGPathElement;
    return {
      instant() {
        gsap.set(bandEl, { opacity: 1 });
        setDrawn(medEl);
      },
      play() {
        gsap.set(bandEl, { opacity: 0, transformOrigin: "left center", scaleX: 0.6 });
        drawInit(medEl);
        const tl = gsap.timeline();
        tl.to(bandEl, { opacity: 1, scaleX: 1, duration: 1.0, ease: "power3.out" }, 0).to(
          medEl,
          { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" },
          0.1,
        );
      },
    };
  });

  return (
    <div className="pillar-diagram" ref={ref}>
      <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path className="pb-band" d={band} fill="var(--accent-tint)" stroke="none" />
        <path className="pb-median" d={median} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <p className="diagram-cap">{caption}</p>
    </div>
  );
}

/* ============ pillar 02, demand density ============ */
export function PillarDensity({ caption }: { caption?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { bars, curve } = useMemo(() => {
    const NB = 17, x0 = 20, x1 = 340, baseY = 128, maxH = 96;
    const vals: number[] = [];
    for (let i = 0; i < NB; i++) {
      const tt = i / (NB - 1);
      const am = Math.exp(-Math.pow((tt - 0.22) / 0.12, 2));
      const pm = Math.exp(-Math.pow((tt - 0.78) / 0.13, 2));
      vals.push(0.12 + 0.95 * Math.max(am, pm * 0.92));
    }
    const bw = ((x1 - x0) / NB) * 0.62, gap = (x1 - x0) / NB;
    const pts: number[][] = [];
    const bars = vals.map((v, i) => {
      const x = x0 + i * gap + gap * 0.19;
      const h = v * maxH;
      pts.push([x + bw / 2, baseY - h]);
      return { x, w: bw, baseY, h };
    });
    return { bars, curve: smooth(pts) };
  }, []);

  useDiagram(ref, (root) => {
    const rects = root.querySelectorAll<SVGRectElement>(".pd-bars rect");
    const curveEl = root.querySelector(".pd-curve") as SVGPathElement;
    return {
      instant() {
        rects.forEach((r) => {
          const h = Number(r.dataset.h);
          r.setAttribute("y", String(Number(r.dataset.basey) - h));
          r.setAttribute("height", String(h));
        });
        setDrawn(curveEl);
      },
      play() {
        drawInit(curveEl);
        const tl = gsap.timeline();
        tl.to(Array.from(rects), {
          attr: {
            height: (_i: number, target: SVGRectElement) => Number(target.dataset.h),
            y: (_i: number, target: SVGRectElement) => Number(target.dataset.basey) - Number(target.dataset.h),
          },
          duration: 0.7,
          stagger: 0.035,
          ease: "power2.out",
        }, 0).to(curveEl, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" }, 0.25);
      },
    };
  });

  return (
    <div className="pillar-diagram" ref={ref}>
      <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g className="pd-bars">
          {bars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              width={b.w}
              y={b.baseY}
              height={0}
              rx="1.5"
              fill="var(--surface-3)"
              data-h={b.h}
              data-basey={b.baseY}
            />
          ))}
        </g>
        <path className="pd-curve" d={curve} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <p className="diagram-cap">{caption}</p>
    </div>
  );
}

/* ============ pillar 03, transfer sync ============ */
export function PillarSync({ caption }: { caption?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x0 = 20, x1 = 340, yA = 48, yB = 104, off = 30;
  const ticksA = [0, 1, 2, 3, 4].map((i) => x0 + 40 + i * 66);
  const cons = [0, 1, 2, 3, 4].map((i) => x0 + 42 + i * 66);

  useDiagram(ref, (root) => {
    const tb = root.querySelectorAll<SVGRectElement>(".ps-lineB rect");
    const conEls = root.querySelectorAll<SVGLineElement>(".ps-buffer line");
    return {
      instant() {
        tb.forEach((tk, i) => tk.setAttribute("x", String(x0 + 40 + i * 66)));
        gsap.set(Array.from(conEls), { opacity: 0.6 });
      },
      play() {
        gsap.set(Array.from(conEls), { opacity: 0 });
        tb.forEach((tk, i) => gsap.set(tk, { attr: { x: x0 + 40 + i * 66 + off } }));
        const tl = gsap.timeline();
        tl.to(Array.from(tb), {
          attr: { x: (i: number) => x0 + 40 + i * 66 },
          duration: 1.0,
          ease: "power3.inOut",
          stagger: 0.04,
        }, 0.1).to(Array.from(conEls), { opacity: 0.6, duration: 0.5, stagger: 0.05 }, 0.7);
      },
    };
  });

  return (
    <div className="pillar-diagram" ref={ref}>
      <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g className="ps-lineA">
          <line x1={x0} x2={x1} y1={yA} y2={yA} stroke="var(--hairline-2)" strokeWidth="1.5" />
          {ticksA.map((x, i) => (
            <rect key={i} x={x} y={yA - 11} width="4" height="22" rx="1" fill="var(--ink-soft)" />
          ))}
        </g>
        <g className="ps-lineB">
          <line x1={x0} x2={x1} y1={yB} y2={yB} stroke="var(--hairline-2)" strokeWidth="1.5" />
          {ticksA.map((x, i) => (
            <rect key={i} x={x + off} y={yB - 11} width="4" height="22" rx="1" fill="var(--accent)" />
          ))}
        </g>
        <g className="ps-buffer">
          {cons.map((x, i) => (
            <line key={i} x1={x} x2={x} y1={yA + 11} y2={yB - 11} stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 3" opacity="0" />
          ))}
        </g>
      </svg>
      <p className="diagram-cap">{caption}</p>
    </div>
  );
}

/* ============ pillar 04, before/after simulator ============ */
export function PillarSim({ caption }: { caption?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  const x0 = 20, baseY = 120, gap = 36, bw = 22;
  const varied = [34, 70, 22, 88, 40, 78, 28, 64, 36];
  const even = 52;

  useDiagram(ref, (root) => {
    const rects = root.querySelectorAll<SVGRectElement>(".psim-after rect");
    const stateLabel = root.querySelector(".psim-state") as SVGTextElement;
    const after = t("SESUDAH", "AFTER");
    return {
      instant() {
        rects.forEach((r) => {
          r.setAttribute("y", String(baseY - even));
          r.setAttribute("height", String(even));
          r.setAttribute("fill", "var(--accent)");
        });
        stateLabel.textContent = after;
      },
      play() {
        rects.forEach((r, i) => gsap.set(r, { attr: { y: baseY - varied[i], height: varied[i] }, fill: "var(--ink-faint)" }));
        const tl = gsap.timeline();
        tl.to({}, { duration: 0.6 })
          .add(() => {
            stateLabel.textContent = after;
          })
          .to(Array.from(rects), {
            attr: { y: baseY - even, height: even },
            fill: "var(--accent)",
            duration: 0.9,
            stagger: 0.05,
            ease: "power3.inOut",
          }, "<");
      },
    };
  });

  return (
    <div className="pillar-diagram" ref={ref}>
      <svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g className="psim-after">
          {varied.map((h, i) => (
            <rect key={i} x={x0 + i * gap} width={bw} rx="2" y={baseY - h} height={h} fill="var(--ink-faint)" />
          ))}
        </g>
        <g className="psim-labels" fontFamily="var(--font-geist-mono), monospace" fontSize="12" fill="var(--ink-faint)">
          <text className="psim-state" x={x0} y={baseY + 22}>{t("SEBELUM", "BEFORE")}</text>
        </g>
      </svg>
      <p className="diagram-cap">{caption}</p>
    </div>
  );
}

/* ============ corridor schematic (DISHUB) ============ */
export function CorridorSchematic({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const { segs, stations } = useMemo(() => {
    const HUB = [372, 250];
    const main = [
      [96, 404], [232, 404], [330, 306], [330, 196], [452, 74], [624, 74],
    ];
    const segs: number[][] = [];
    for (let i = 0; i < main.length - 1; i++) {
      const rel = i >= 2 ? 1 : 0;
      segs.push([...main[i], ...main[i + 1], rel]);
    }
    const branches: [number[], number[], number][] = [
      [[372, 110], HUB, 1],
      [[372, 250], [372, 396], 1],
      [[516, 150], HUB, 0],
      [[212, 168], HUB, 0],
    ];
    branches.forEach((b) => segs.push([...b[0], ...b[1], b[2]]));
    const stations = [
      [96, 404], [232, 404], [330, 306], [330, 196], [452, 74], [624, 74], [372, 110], [372, 396], [516, 150], [212, 168],
    ];
    return { segs, stations, HUB };
  }, []);

  const HUB = [372, 250];

  useDiagram(ref, (root) => {
    const paths = root.querySelectorAll<SVGLineElement>(".corridor-lines line");
    const dots = root.querySelectorAll<SVGCircleElement>(".corridor-stations circle");
    const hub = root.querySelector(".corridor-hub") as SVGRectElement;
    const labels = root.querySelectorAll<SVGTextElement>(".corridor-labels text");
    return {
      instant() {
        paths.forEach((p) => {
          p.style.strokeDasharray = "none";
          p.style.strokeDashoffset = "0";
        });
        gsap.set([Array.from(dots), hub, Array.from(labels)], { opacity: 1 });
      },
      play() {
        gsap.set([Array.from(dots), hub, Array.from(labels)], { opacity: 0 });
        const tl = gsap.timeline();
        paths.forEach((p, i) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          tl.to(p, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, i * 0.08);
        });
        tl.to(Array.from(dots), { opacity: 1, duration: 0.4, stagger: 0.03 }, 0.5)
          .to(hub, { opacity: 1, scale: 1, transformOrigin: "center", duration: 0.5, ease: "back.out(2)" }, 0.7)
          .to(Array.from(labels), { opacity: 1, duration: 0.4, stagger: 0.05 }, 0.8);
      },
    };
  });

  return (
    <div className="corridor-frame" data-viz="corridor" ref={ref}>
      <svg viewBox="0 0 720 460" preserveAspectRatio="xMidYMid meet" aria-label="Skema koridor dengan lapisan keandalan">
        <g className="corridor-lines">
          {segs.map((s, i) => (
            <line
              key={i}
              x1={s[0]}
              y1={s[1]}
              x2={s[2]}
              y2={s[3]}
              stroke={s[4] ? "var(--accent)" : "var(--ink-faint)"}
              strokeWidth={s[4] ? 4 : 3}
              strokeLinecap="round"
            />
          ))}
        </g>
        <g className="corridor-stations">
          {stations.map((st, i) => (
            <circle key={i} cx={st[0]} cy={st[1]} r="4.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
          ))}
          <rect
            className="corridor-hub"
            x={HUB[0] - 9}
            y={HUB[1] - 9}
            width="18"
            height="18"
            transform={`rotate(45 ${HUB[0]} ${HUB[1]})`}
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth="2.5"
          />
        </g>
        <g className="corridor-labels" fontFamily="var(--font-geist-mono), monospace" fontSize="13">
          <text x="96" y="430" fill="var(--ink-soft)" textAnchor="middle">Blok M</text>
          <text x="624" y="62" fill="var(--ink-soft)" textAnchor="middle">Kota</text>
          <text x={HUB[0] + 18} y={HUB[1] + 5} fill="var(--accent)" fontWeight="500">Dukuh Atas</text>
          <text x="372" y="100" fill="var(--ink-faint)" textAnchor="middle" fontSize="11">MRT</text>
          <text x="528" y="146" fill="var(--ink-faint)" fontSize="11">LRT</text>
          <text x="196" y="160" fill="var(--ink-faint)" textAnchor="end" fontSize="11">KRL</text>
        </g>
      </svg>
      {children}
    </div>
  );
}

/* ============ target projection (DISHUB) ============ */
export function TargetProjection() {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  const { L, R, BOT, lineD, areaD, grid, cur, tgt } = useMemo(() => {
    const L = 70, R = 600, TOP = 44, BOT = 300;
    const yFor = (pct: number) => BOT - (pct / 66) * (BOT - TOP);
    const xFor = (rel: number) => L + (rel / 100) * (R - L);
    const pts: number[][] = [];
    for (let rel = 18; rel <= 96; rel += 6) {
      const tt = (rel - 18) / (96 - 18);
      const pct = 6 + (60 - 6) * Math.pow(tt, 1.7);
      pts.push([xFor(rel), yFor(pct)]);
    }
    const lineD = smooth(pts);
    const areaD = lineD + ` L ${pts[pts.length - 1][0]} ${BOT} L ${pts[0][0]} ${BOT} Z`;
    const grid = [0, 20, 40, 60].map((p) => ({ y: yFor(p), label: p + "%" }));
    return { L, R, BOT, lineD, areaD, grid, cur: [xFor(35), yFor(8.8)], tgt: [xFor(92), yFor(60)] };
  }, []);

  useDiagram(ref, (root) => {
    const line = root.querySelector(".tg-line") as SVGPathElement;
    const area = root.querySelector(".tg-area") as SVGPathElement;
    const marks = root.querySelectorAll<Element>(".tg-marks > *");
    const gridEls = root.querySelectorAll<Element>(".tg-grid > *");
    return {
      instant() {
        setDrawn(line);
        gsap.set([area, Array.from(marks), Array.from(gridEls)], { opacity: 1 });
      },
      play() {
        drawInit(line);
        gsap.set(area, { opacity: 0 });
        gsap.set(Array.from(marks), { opacity: 0 });
        gsap.set(Array.from(gridEls), { opacity: 0 });
        const tl = gsap.timeline();
        tl.to(Array.from(gridEls), { opacity: 1, duration: 0.5, stagger: 0.04 }, 0)
          .to(line, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 0.2)
          .to(area, { opacity: 1, duration: 1.0 }, 0.4)
          .to(Array.from(marks), { opacity: 1, duration: 0.5, stagger: 0.08 }, 1.0);
      },
    };
  });

  return (
    <div className="target-viz" data-viz="target" aria-label="Reliability to mode share projection" ref={ref}>
      <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g className="tg-grid" stroke="var(--hairline)" strokeWidth="1">
          {grid.map((g, i) => (
            <line key={"l" + i} x1={L} x2={R} y1={g.y} y2={g.y} />
          ))}
          {grid.map((g, i) => (
            <text
              key={"t" + i}
              x={L - 10}
              y={g.y + 4}
              textAnchor="end"
              fontFamily="var(--font-geist-mono), monospace"
              fontSize="12"
              fill="var(--ink-faint)"
              stroke="none"
            >
              {g.label}
            </text>
          ))}
        </g>
        <path className="tg-area" d={areaD} fill="var(--accent-tint)" stroke="none" />
        <path className="tg-line" d={lineD} fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
        <g className="tg-marks" fontFamily="var(--font-geist-mono), monospace" fontSize="14">
          <circle cx={cur[0]} cy={cur[1]} r="5" fill="var(--ink)" stroke="var(--surface)" strokeWidth="2" />
          <text x={cur[0] + 12} y={cur[1] + 4} fill="var(--ink-soft)">8,8% · 2018</text>
          <circle cx={tgt[0]} cy={tgt[1]} r="6" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
          <text x={tgt[0] - 12} y={tgt[1] - 12} textAnchor="end" fill="var(--accent)" fontWeight="500">60% · 2030</text>
          <text x={R} y={BOT + 26} textAnchor="end" fill="var(--ink-faint)" fontSize="11">
            {t("SKOR KEANDALAN →", "RELIABILITY SCORE →")}
          </text>
        </g>
      </svg>
    </div>
  );
}
