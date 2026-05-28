"use client";

import { useMemo, useState } from "react";
import { Icon, StatusDot } from "../icons";
import { Wordmark } from "../chrome";
import { useAppNav } from "../use-nav";
import { useAppTheme } from "../theme-context";
import { band, corridors, findCorridor, modeLabel, type BandPoint } from "@/lib/data";

function riderVerdict(score: number): { head: string; tone: "ok" | "warn" | "alert"; note: string } {
  if (score >= 90)
    return {
      head: "Tepat waktu hampir setiap hari",
      tone: "ok",
      note: "Layanan ini jarang meleset dari jadwal. Anda bisa mengandalkannya.",
    };
  if (score >= 80)
    return {
      head: "Cukup bisa diandalkan",
      tone: "ok",
      note: "Biasanya tepat waktu, dengan sedikit keterlambatan saat jam ramai.",
    };
  if (score >= 68)
    return {
      head: "Agak meleset saat sore",
      tone: "warn",
      note: "Pagi cenderung lancar. Sore hari sering lebih lama dari biasanya.",
    };
  if (score >= 55)
    return {
      head: "Sering terlambat di jam sibuk",
      tone: "warn",
      note: "Beri waktu tambahan bila bepergian pada pagi atau sore.",
    };
  return {
    head: "Sulit ditebak hari ini",
    tone: "alert",
    note: "Layanan sedang terganggu. Pertimbangkan rute atau moda lain bila memungkinkan.",
  };
}

function nextHourBlocks(series: BandPoint[]) {
  const slice = series.slice(0, 36);
  const blocks: { tone: "ok" | "warn" | "alert"; label: string }[] = [];
  for (let b = 0; b < 6; b++) {
    const part = slice.slice(b * 6, b * 6 + 6);
    const conf = part.reduce((s, p) => s + p.conf, 0) / part.length;
    const tone = conf > 0.62 ? "ok" : conf > 0.4 ? "warn" : "alert";
    const label = tone === "ok" ? "Lancar" : tone === "warn" ? "Agak padat" : "Tak menentu";
    blocks.push({ tone, label });
  }
  return blocks;
}

const TONE_COLOR: Record<string, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  alert: "var(--alert)",
};

export function RiderScreen() {
  const navigate = useAppNav();
  const { theme, density, motion, toggleTheme } = useAppTheme();
  const [routeId, setRouteId] = useState("tj-1");
  const c = findCorridor(routeId) || corridors[0];
  const v = riderVerdict(c.score);
  const series = useMemo(() => band(c.seed + 5, 40, { spread: c.spread, drift: c.drift }), [c]);
  const blocks = nextHourBlocks(series);
  const hourLabels = ["sekarang", "+10", "+20", "+30", "+40", "+50"];

  return (
    <div className="tiba-app" data-theme={theme} data-density={density} data-motion={motion}>
      <div className="rider">
        <div className="rider__bar">
          <Wordmark size={18} />
          <span className="brand-sub" style={{ borderLeft: "1px solid var(--line)", paddingLeft: 12 }}>
            Keandalan layanan
          </span>
          <div style={{ flex: 1 }} />
          <button className="icon-btn" onClick={toggleTheme} aria-label="Ganti mode">
            <Icon name={theme === "dark" ? "moon" : "sun"} size={17} />
          </button>
          <button className="btn btn--sm" onClick={() => navigate("operator")}>
            <Icon name="activity" size={14} /> Konsol operator
          </button>
        </div>

        <div className="rider__wrap">
          <div className="col" style={{ gap: 14 }}>
            <div className="rider-route">
              <span className="badge">{c.code}</span>
              <span className="muted" style={{ fontSize: 14 }}>
                {modeLabel[c.mode]}
              </span>
            </div>
            <h1>{c.name.split(":")[1] ? c.name.split(":")[1].trim() : c.name}</h1>
            <div className="rider-verdict">
              <StatusDot status={v.tone} label="" />
              <span style={{ marginLeft: 4 }}>{v.head}</span>
            </div>
            <p style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.55, maxWidth: 560 }}>{v.note}</p>
          </div>

          <div className="rider-card">
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Bagaimana jam berikutnya biasanya berjalan
            </div>
            <div className="rider-hours">
              {blocks.map((b, i) => (
                <div className="rider-hour" key={i}>
                  <div
                    className="blk"
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--line)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: b.tone === "ok" ? "34%" : b.tone === "warn" ? "62%" : "90%",
                        background: TONE_COLOR[b.tone],
                        opacity: 0.85,
                        transition: "height var(--dur-slow) var(--ease)",
                      }}
                    />
                  </div>
                  <span className="ql">{b.label}</span>
                  <span className="hl">{hourLabels[i]}</span>
                </div>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 16, lineHeight: 1.5 }}>
              Tinggi batang menunjukkan seberapa banyak waktu cadangan yang sebaiknya Anda siapkan. Makin penuh, makin
              baik beri waktu lebih.
            </p>
          </div>

          <div className="col" style={{ gap: 10 }}>
            <div className="eyebrow">Layanan lain</div>
            <div className="rider-list">
              {corridors
                .filter((x) => x.id !== c.id)
                .slice(0, 5)
                .map((x) => {
                  const xv = riderVerdict(x.score);
                  return (
                    <a
                      key={x.id}
                      onClick={() => {
                        setRouteId(x.id);
                        window.scrollTo({ top: 0 });
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setRouteId(x.id);
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: "var(--r-sm)",
                          border: "1px solid var(--line)",
                          background: "var(--bg-2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {x.code}
                      </span>
                      <span className="rl-name">{x.name.split(":")[1] ? x.name.split(":")[1].trim() : x.name}</span>
                      <StatusDot status={xv.tone} label="" />
                      <span className="rl-verdict">{xv.head}</span>
                      <Icon name="chevronRight" size={16} />
                    </a>
                  );
                })}
            </div>
          </div>

          <p
            className="muted"
            style={{ fontSize: 12, lineHeight: 1.5, borderTop: "1px solid var(--line)", paddingTop: 18 }}
          >
            Informasi keandalan disediakan oleh Tiba untuk Dinas Perhubungan DKI Jakarta. Estimasi bersifat indikatif
            dan dapat berubah sesuai kondisi di lapangan.
          </p>
        </div>
      </div>
    </div>
  );
}
