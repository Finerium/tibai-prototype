"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, Trend, StatusDot } from "../icons";
import { ProbabilityBand, CauseBars } from "../charts";
import { useAppNav } from "../use-nav";
import {
  band,
  corridors,
  findCorridor,
  interventions,
  modeIcon,
  modeLabel,
  statusLabel,
  type Corridor,
} from "@/lib/data";

function CorridorPicker({
  corridors,
  current,
  onPick,
}: {
  corridors: Corridor[];
  current: string;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = corridors.find((c) => c.id === current);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn--sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox">
        <span className="mono">{cur ? cur.code : "-"}</span> Ganti koridor <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            width: 320,
            background: "var(--bg-1)",
            border: "1px solid var(--line-strong)",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow)",
            overflow: "hidden",
            padding: 6,
          }}
        >
          {corridors.map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === current}
              className="cmdk__item"
              style={{ width: "100%" }}
              onClick={() => {
                onPick(c.id);
                setOpen(false);
              }}
            >
              <Icon name={modeIcon[c.mode]} size={15} />
              <span className="ci-title" style={{ flex: 1, textAlign: "left" }}>
                {c.code} · {c.name.split(":")[1] || c.name}
              </span>
              <span className="status">
                <span
                  className="dot round"
                  style={{
                    background:
                      c.status === "ok" ? "var(--ok)" : c.status === "warn" ? "var(--warn)" : "var(--alert)",
                  }}
                />
              </span>
              <span className="ci-sub">{c.score}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CorridorScreen({ corridorId }: { corridorId: string }) {
  const navigate = useAppNav();
  const c = findCorridor(corridorId) || corridors[0];
  const series = useMemo(() => band(c.seed, 48, { spread: c.spread, drift: c.drift }), [c]);

  const ivs = interventions.filter((i) => i.corridor === c.id);
  const effortLabel: Record<string, string> = { rendah: "rendah", sedang: "sedang", tinggi: "tinggi" };

  return (
    <div className="screen">
      <div className="screen__inner">
        <div className="page-head">
          <div className="titles">
            <div className="crumbs">
              <button onClick={() => navigate("operator")}>Operasi</button>
              <Icon name="chevronRight" size={13} />
              <span>Koridor</span>
            </div>
            <h1>{c.name}</h1>
            <div className="wrap-gap" style={{ marginTop: 4 }}>
              <span className="pill pill--neutral">
                <Icon name={modeIcon[c.mode]} size={12} /> {modeLabel[c.mode]}
              </span>
              <StatusDot status={c.status} label={statusLabel[c.status]} />
              <span className="muted mono" style={{ fontSize: 11.5 }}>
                {c.stations} stasiun · {c.lengthKm} km · headway {c.headwayMin}m
              </span>
            </div>
          </div>
          <div className="spacer" />
          <div className="head-actions">
            <CorridorPicker corridors={corridors} current={c.id} onPick={(id) => navigate("corridors", id)} />
            <button className="btn btn--sm">
              <Icon name="external" size={14} /> Ekspor
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 348px", gap: "var(--gap)", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minWidth: 0 }}>
            <section className="panel">
              <div className="panel__head">
                <h3>Pita keandalan kedatangan</h3>
                <span className="sub">P10 · P50 · P90 · penyimpangan dari jadwal</span>
                <span className="spacer" />
                <span className="muted mono" style={{ fontSize: 11 }}>
                  Segmen kepercayaan rendah tampak lebih kabur
                </span>
              </div>
              <div className="panel__body">
                <ProbabilityBand series={series} variant="filled" height={300} unit="menit" />
              </div>
            </section>

            <section className="panel">
              <div className="panel__head">
                <h3>Dekomposisi kausal ketidakandalan</h3>
                <span className="sub">kontribusi terurut</span>
              </div>
              <div className="panel__body">
                <CauseBars causes={c.causes} />
              </div>
            </section>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
            <section className="panel">
              <div className="panel__head">
                <h3>Ringkasan</h3>
              </div>
              <div className="panel__body" style={{ paddingTop: 4, paddingBottom: 4 }}>
                <div className="kv-grid" style={{ border: 0 }}>
                  <div className="kv" style={{ padding: "12px 4px" }}>
                    <span className="k">Skor keandalan</span>
                    <span className="v" style={{ fontSize: 26 }}>
                      {c.score}
                    </span>
                  </div>
                  <div className="kv" style={{ padding: "12px 4px" }}>
                    <span className="k">Tren 7 hari</span>
                    <span className="v" style={{ fontSize: 20 }}>
                      <Trend value={c.trend} />
                    </span>
                  </div>
                  <div className="kv" style={{ padding: "12px 4px" }}>
                    <span className="k">Median P50</span>
                    <span className="v">
                      {c.p50 > 0 ? "+" : ""}
                      {c.p50}m
                    </span>
                  </div>
                  <div className="kv" style={{ padding: "12px 4px" }}>
                    <span className="k">Rentang P10-P90</span>
                    <span className="v">
                      {c.p10} / +{c.p90}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel__head">
                <h3>Kepercayaan per segmen</h3>
              </div>
              <div className="panel__body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {c.seg.map((s, i) => (
                  <div key={i} className="col" style={{ gap: 5 }}>
                    <div className="row between">
                      <span
                        style={{
                          fontSize: 12.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minWidth: 0,
                        }}
                      >
                        {s.name}
                      </span>
                      <span className="mono muted" style={{ fontSize: 11.5, flex: "none" }}>
                        {Math.round(s.conf * 100)}%
                      </span>
                    </div>
                    <div className="cause-bar">
                      <i
                        style={{
                          width: s.conf * 100 + "%",
                          background:
                            s.conf > 0.6 ? "var(--accent)" : s.conf > 0.4 ? "var(--warn)" : "var(--alert)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel__head">
                <h3>Intervensi disarankan</h3>
                <span className="sub">elastisitas mode-share</span>
              </div>
              {ivs.length ? (
                <div className="iv-list">
                  {ivs.map((iv, i) => (
                    <div className="iv-item" key={iv.id} style={{ cursor: "default" }}>
                      <span className="iv-rank">{String(i + 1).padStart(2, "0")}</span>
                      <span className="iv-main">
                        <div className="iv-title">{iv.title}</div>
                        <div className="iv-meta">
                          <span>upaya {effortLabel[iv.effort]}</span>
                          <span>·</span>
                          <span>keyakinan {Math.round(iv.confidence * 100)}%</span>
                        </div>
                      </span>
                      <span className="iv-impact">+{iv.impact}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="state-block">
                  <div className="ico">
                    <Icon name="check" size={22} />
                  </div>
                  <h3>Tidak ada intervensi prioritas</h3>
                  <p>Koridor ini berada di atas ambang keandalan. Pemantauan rutin berlanjut.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
