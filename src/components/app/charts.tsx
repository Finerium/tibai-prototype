"use client";

import { useId } from "react";
import { useReducedMotion } from "motion/react";
import type { BandPoint, Cause } from "@/lib/data";

/**
 * Probability-band chart (P10 / P50 / P90). Uncertainty is made visible:
 * lower-confidence segments render less crisp. Treatments: filled / soft /
 * stepped fan.
 */
export function ProbabilityBand({
  series,
  variant = "filled",
  height = 260,
  targetAt = 0,
  unit = "mnt",
  showAxis = true,
}: {
  series: BandPoint[];
  variant?: "filled" | "soft" | "stepped";
  height?: number;
  targetAt?: number;
  unit?: string;
  showAxis?: boolean;
}) {
  const W = 760,
    H = height;
  const padL = 38,
    padR = 14,
    padT = 16,
    padB = showAxis ? 26 : 10;
  const innerW = W - padL - padR,
    innerH = H - padT - padB;

  const allLo = Math.min(...series.map((p) => p.p10));
  const allHi = Math.max(...series.map((p) => p.p90));
  const dMin = Math.min(allLo, targetAt) - 1.5;
  const dMax = Math.max(allHi, targetAt) + 1.5;
  const rng = dMax - dMin || 1;

  const X = (t: number) => padL + t * innerW;
  const Y = (v: number) => padT + (1 - (v - dMin) / rng) * innerH;

  const uid = "pb" + useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  const yticks: number[] = [];
  const step = rng > 24 ? 10 : rng > 12 ? 5 : 2;
  const startTick = Math.ceil(dMin / step) * step;
  for (let v = startTick; v <= dMax; v += step) yticks.push(v);

  const xticks = [0, 0.25, 0.5, 0.75, 1];
  const clock = (t: number) => {
    const h = Math.round(5 + t * 18);
    return String(h).padStart(2, "0") + ":00";
  };

  const slices: { d: string; conf: number }[] = [];
  for (let i = 0; i < series.length - 1; i++) {
    const a = series[i],
      b = series[i + 1];
    const conf = (a.conf + b.conf) / 2;
    const d = `M ${X(a.t)} ${Y(a.p90)} L ${X(b.t)} ${Y(b.p90)} L ${X(b.t)} ${Y(b.p10)} L ${X(a.t)} ${Y(a.p10)} Z`;
    slices.push({ d, conf });
  }
  const segs: { x1: number; y1: number; x2: number; y2: number; conf: number }[] = [];
  for (let i = 0; i < series.length - 1; i++) {
    const a = series[i],
      b = series[i + 1];
    segs.push({ x1: X(a.t), y1: Y(a.p50), x2: X(b.t), y2: Y(b.p50), conf: (a.conf + b.conf) / 2 });
  }

  const fanIdx = series.map((_, i) => i).filter((_, i) => i % 2 === 0);

  return (
    <div className="pbchart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label="Pita keandalan kedatangan P10 P50 P90"
      >
        <defs>
          <filter id={uid + "-soft"} x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
          <clipPath id={uid + "-clip"}>
            <rect x={padL} y={padT - 4} width={innerW} height={innerH + 8} />
          </clipPath>
        </defs>

        <g className="pb-grid">
          {yticks.map((v, i) => (
            <line key={i} x1={padL} x2={W - padR} y1={Y(v)} y2={Y(v)} />
          ))}
        </g>
        <line className="pb-target" x1={padL} x2={W - padR} y1={Y(targetAt)} y2={Y(targetAt)} />

        <g clipPath={`url(#${uid}-clip)`}>
          {variant === "stepped"
            ? fanIdx.map((i) => {
                const p = series[i];
                const x = X(p.t);
                const half = ((X(1) - X(0)) / series.length) * 0.7;
                const op = 0.16 + p.conf * 0.34;
                return (
                  <g key={i}>
                    <rect
                      x={x - half}
                      y={Y(p.p90)}
                      width={half * 2}
                      height={Math.max(1, Y(p.p10) - Y(p.p90))}
                      fill="var(--accent)"
                      opacity={op}
                      rx="2"
                    />
                    <line
                      x1={x - half}
                      x2={x + half}
                      y1={Y(p.p50)}
                      y2={Y(p.p50)}
                      stroke="var(--accent)"
                      strokeWidth="2"
                      opacity={0.5 + p.conf * 0.5}
                    />
                  </g>
                );
              })
            : (
              <g filter={variant === "soft" && !reduce ? `url(#${uid}-soft)` : undefined}>
                {slices.map((s, i) => (
                  <path
                    key={i}
                    d={s.d}
                    fill="var(--accent)"
                    opacity={(variant === "soft" ? 0.14 : 0.1) + s.conf * 0.3}
                    stroke="none"
                  />
                ))}
              </g>
            )}
        </g>

        {variant !== "stepped" && (
          <g clipPath={`url(#${uid}-clip)`}>
            {segs.map((s, i) => (
              <line
                key={i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={0.35 + s.conf * 0.65}
                strokeDasharray={s.conf < 0.45 ? "4 4" : undefined}
              />
            ))}
          </g>
        )}

        {showAxis && (
          <g className="pb-axis">
            {yticks.map((v, i) => (
              <text key={i} x={padL - 8} y={Y(v) + 3} textAnchor="end">
                {v > 0 ? "+" + v : v}
              </text>
            ))}
            {xticks.map((t, i) => (
              <text
                key={i}
                x={X(t)}
                y={H - 8}
                textAnchor={i === 0 ? "start" : i === xticks.length - 1 ? "end" : "middle"}
              >
                {clock(t)}
              </text>
            ))}
          </g>
        )}
      </svg>
      <div className="chart-legend">
        <span className="ci">
          <span className="swl" style={{ background: "var(--accent)", opacity: 0.4 }} />
          Pita P10-P90
        </span>
        <span className="ci">
          <span className="swline" />
          Median P50
        </span>
        <span className="ci">
          <span className="swl" style={{ background: "var(--accent)", opacity: 0.14 }} />
          Kepercayaan rendah (pita melebar)
        </span>
        <span className="ci muted" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
          satuan: {unit} dari jadwal
        </span>
      </div>
    </div>
  );
}

/* causal decomposition, ranked horizontal bars */
export function CauseBars({ causes }: { causes: Cause[] }) {
  const max = Math.max(...causes.map((c) => c.v));
  return (
    <div>
      {causes.map((c, i) => (
        <div className="cause-row" key={i}>
          <div className="cl">{c.k}</div>
          <div className="cv num">{c.v}%</div>
          {c.note ? <div className="cn">{c.note}</div> : <div className="cn" />}
          <div className="cause-bar">
            <i
              style={{
                width: (c.v / max) * 100 + "%",
                background: i === 0 ? "var(--accent)" : "var(--accent-quiet)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
