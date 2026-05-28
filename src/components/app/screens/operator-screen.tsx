"use client";

import { useMemo, useState } from "react";
import { Icon, Trend, Spark } from "../icons";
import { ProbabilityBand, CauseBars } from "../charts";
import { MapCanvas } from "../map";
import { Inspector } from "../chrome";
import { useAppNav } from "../use-nav";
import {
  agency,
  band,
  corridors,
  findCorridor,
  interchange,
  interventions,
  kpis,
  modeIcon,
  modeLabel,
  statusLabel,
  type Corridor,
  type Intervention,
  type Kpi,
} from "@/lib/data";

function KpiStrip({ kpis, variant }: { kpis: Kpi[]; variant: "A" | "B" | "C" }) {
  return (
    <div className={"kpi-strip kpi-" + variant}>
      {kpis.map((k) => (
        <div key={k.id} className={"kpi" + (k.hero ? " hero" : "")}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-val">
            <span className="v">{k.value}</span>
            {k.unit && <span className="u">{k.unit}</span>}
          </div>
          <div className="kpi-foot">
            <Trend value={k.trend} invert={k.invert} suffix={k.unit === "%" ? "%" : ""} />
            <span className="kpi-sub">{k.sub}</span>
          </div>
          {(variant === "A" || variant === "C") && (
            <span className="kpi-spark">
              <Spark data={k.spark} invert={k.invert} w={variant === "C" ? 120 : 64} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function InterventionPanel({
  interventions,
  onOpen,
}: {
  interventions: Intervention[];
  onOpen: (iv: Intervention) => void;
}) {
  const [sort, setSort] = useState<"impact" | "confidence">("impact");
  const sorted = useMemo(() => {
    const a = [...interventions];
    if (sort === "impact") a.sort((x, y) => y.impact - x.impact);
    else if (sort === "confidence") a.sort((x, y) => y.confidence - x.confidence);
    return a;
  }, [interventions, sort]);

  const effortLabel: Record<string, string> = {
    rendah: "Upaya rendah",
    sedang: "Upaya sedang",
    tinggi: "Upaya tinggi",
  };

  return (
    <section className="panel">
      <div className="panel__head">
        <h3>Intervensi terurut</h3>
        <span className="sub">{interventions.length} usulan</span>
        <span className="spacer" />
        <div className="seg" style={{ height: 28 }}>
          <button aria-pressed={sort === "impact"} onClick={() => setSort("impact")} style={{ height: 24, fontSize: 11 }}>
            Dampak
          </button>
          <button
            aria-pressed={sort === "confidence"}
            onClick={() => setSort("confidence")}
            style={{ height: 24, fontSize: 11 }}
          >
            Keyakinan
          </button>
        </div>
      </div>
      <div className="iv-list">
        {sorted.map((iv, i) => {
          const c = findCorridor(iv.corridor);
          return (
            <button className="iv-item" key={iv.id} onClick={() => onOpen(iv)}>
              <span className="iv-rank">{String(i + 1).padStart(2, "0")}</span>
              <span className="iv-main">
                <div className="iv-title">{iv.title}</div>
                <div className="iv-meta">
                  <span>{c ? c.code : ""}</span>
                  <span>·</span>
                  <span>{effortLabel[iv.effort]}</span>
                  <span>·</span>
                  <span>keyakinan {Math.round(iv.confidence * 100)}%</span>
                </div>
              </span>
              <span className="iv-impact">+{iv.impact}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SimulatorPanel() {
  const [mode, setMode] = useState<"before" | "after">("after");
  const before = { score: 73, success: 82, p90: 14 };
  const after = { score: 82, success: 90, p90: 9 };
  const cur = mode === "after" ? after : before;
  const show = (k: keyof typeof cur, suffix = "") => (
    <span className="num">
      {cur[k]}
      {suffix}
    </span>
  );
  return (
    <section className="panel">
      <div className="panel__head">
        <h3>Simulator koridor</h3>
        <span className="sub">K6 · prioritas sinyal</span>
        <span className="spacer" />
        <div className="sim-toggle">
          <button aria-pressed={mode === "before"} onClick={() => setMode("before")}>
            Sebelum
          </button>
          <button aria-pressed={mode === "after"} onClick={() => setMode("after")}>
            Sesudah
          </button>
        </div>
      </div>
      <div className="panel__body">
        <div className="sim-metrics">
          <div className="sim-metric">
            <div className="k">Skor</div>
            <div className="v">
              {show("score")} {mode === "after" && <Trend value={+9} />}
            </div>
          </div>
          <div className="sim-metric">
            <div className="k">Transfer</div>
            <div className="v">
              {show("success", "%")} {mode === "after" && <Trend value={+8} suffix="%" />}
            </div>
          </div>
          <div className="sim-metric">
            <div className="k">P90</div>
            <div className="v">
              {show("p90", "m")} {mode === "after" && <Trend value={-5} invert suffix="m" />}
            </div>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
          Pratinjau dampak prioritas sinyal di koridor 6 (Mampang-Kuningan) terhadap keandalan, sebelum diterapkan ke
          lapangan.
        </p>
      </div>
    </section>
  );
}

function CorridorInspectorBody({ corridor: c }: { corridor: Corridor }) {
  const series = useMemo(() => band(c.seed, 40, { spread: c.spread, drift: c.drift }), [c]);
  return (
    <>
      <div className="kv-grid">
        <div className="kv">
          <span className="k">Skor</span>
          <span className="v">{c.score}</span>
        </div>
        <div className="kv">
          <span className="k">Tren 7h</span>
          <span className="v" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Trend value={c.trend} />
          </span>
        </div>
        <div className="kv">
          <span className="k">P50</span>
          <span className="v">
            {c.p50 > 0 ? "+" : ""}
            {c.p50}m
          </span>
        </div>
        <div className="kv">
          <span className="k">P10 / P90</span>
          <span className="v">
            {c.p10} / +{c.p90}
          </span>
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Pita keandalan · hari ini
        </div>
        <ProbabilityBand series={series} variant="filled" height={170} showAxis={false} />
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          Penyebab teratas
        </div>
        <CauseBars causes={c.causes.slice(0, 3)} />
      </div>
    </>
  );
}

function IvDetailBody({ iv }: { iv: Intervention }) {
  const c = findCorridor(iv.corridor);
  return (
    <>
      <div className="kv-grid">
        <div className="kv">
          <span className="k">Estimasi dampak</span>
          <span className="v" style={{ color: "var(--ok)" }}>
            +{iv.impact}
          </span>
        </div>
        <div className="kv">
          <span className="k">Keyakinan</span>
          <span className="v">{Math.round(iv.confidence * 100)}%</span>
        </div>
        <div className="kv">
          <span className="k">Koridor</span>
          <span className="v" style={{ fontSize: 14 }}>
            {c ? c.code : "-"}
          </span>
        </div>
        <div className="kv">
          <span className="k">Upaya</span>
          <span className="v" style={{ fontSize: 14, textTransform: "capitalize" }}>
            {iv.effort}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--text-1)" }}>{iv.detail}</p>
      <div className="login-banner" style={{ background: "var(--tint)", border: "1px solid var(--line)", color: "var(--text-1)" }}>
        <Icon name="info" size={15} /> Elastisitas mode-share diperhitungkan pada estimasi dampak.
      </div>
    </>
  );
}

function IxInspectorBody({ id }: { id: string }) {
  const ix = interchange;
  if (id !== "dukuh-atas") {
    return (
      <div className="state-block">
        <div className="ico">
          <Icon name="shuffle" size={24} />
        </div>
        <h3>Simpul belum dimodelkan</h3>
        <p>Detail sinkronisasi transfer untuk simpul ini belum tersedia.</p>
      </div>
    );
  }
  return (
    <>
      <div className="kv-grid">
        <div className="kv">
          <span className="k">Moda bertemu</span>
          <span className="v">4</span>
        </div>
        <div className="kv">
          <span className="k">Transfer berhasil</span>
          <span className="v">{ix.successCurrent}%</span>
        </div>
        <div className="kv">
          <span className="k">Potensi</span>
          <span className="v" style={{ color: "var(--ok)" }}>
            {ix.successOptimised}%
          </span>
        </div>
        <div className="kv">
          <span className="k">Buffer median</span>
          <span className="v">4.0m</span>
        </div>
      </div>
      <div className="wrap-gap">
        {ix.modes.map((m) => (
          <span key={m.id} className="pill pill--neutral">
            <Icon name={modeIcon[m.mode]} size={12} /> {m.mode}
          </span>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5 }}>
        Empat moda berpotongan di Dukuh Atas. Offset jadwal dapat menaikkan keberhasilan transfer dari{" "}
        {ix.successCurrent}% ke {ix.successOptimised}%.
      </p>
    </>
  );
}

export function OperatorScreen() {
  const navigate = useAppNav();
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [ivOpen, setIvOpen] = useState<Intervention | null>(null);

  const isIx = !!sel && sel.startsWith("ix:");
  const corridor = sel && !isIx ? findCorridor(sel) : null;

  const closeInspector = () => {
    setSel(null);
    setIvOpen(null);
  };

  return (
    <div className="screen">
      <div className="screen__inner">
        <div className="page-head">
          <div className="titles">
            <div className="eyebrow">Operasi langsung · {agency}</div>
            <h1>Konsol keandalan jaringan</h1>
          </div>
          <div className="spacer" />
          <div className="head-actions">
            <button className="btn btn--sm">
              <Icon name="refresh" size={14} /> Segarkan
            </button>
            <button className="btn btn--sm">
              <Icon name="filter" size={14} /> Filter moda
            </button>
            <button className="btn btn--sm btn--primary" onClick={() => navigate("reports")}>
              <Icon name="report" size={14} /> Laporan
            </button>
          </div>
        </div>

        <KpiStrip kpis={kpis} variant="A" />

        <div className="ops-grid">
          <div style={{ position: "relative" }}>
            <MapCanvas
              corridors={corridors}
              selectedId={isIx ? null : sel}
              onSelect={setSel}
              hoveredId={hover}
              onHover={setHover}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
            <InterventionPanel interventions={interventions} onOpen={setIvOpen} />
            <SimulatorPanel />
          </div>
        </div>
      </div>

      <Inspector
        open={!!corridor}
        onClose={closeInspector}
        eyebrow={corridor ? modeLabel[corridor.mode] + " · " + corridor.code : ""}
        title={corridor ? corridor.name.split(":")[1] || corridor.name : ""}
        status={corridor ? corridor.status : null}
        statusLabel={corridor ? statusLabel[corridor.status] : ""}
        footer={
          corridor && (
            <button
              className="btn btn--primary"
              style={{ flex: 1 }}
              onClick={() => navigate("corridors", corridor.id)}
            >
              Buka detail koridor <Icon name="arrowRight" size={15} />
            </button>
          )
        }
      >
        {corridor && <CorridorInspectorBody corridor={corridor} />}
      </Inspector>

      <Inspector
        open={isIx}
        onClose={closeInspector}
        eyebrow="Simpul transfer"
        title={isIx ? (sel!.replace("ix:", "") === "dukuh-atas" ? "Dukuh Atas" : sel!.replace("ix:", "")) : ""}
        status="warn"
        statusLabel="Transfer berisiko"
        footer={
          isIx &&
          sel === "ix:dukuh-atas" && (
            <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => navigate("interchange")}>
              Buka detail simpul <Icon name="arrowRight" size={15} />
            </button>
          )
        }
      >
        {isIx && <IxInspectorBody id={sel!.replace("ix:", "")} />}
      </Inspector>

      <Inspector
        open={!!ivOpen}
        onClose={() => setIvOpen(null)}
        eyebrow="Intervensi"
        title={ivOpen ? ivOpen.title : ""}
        footer={
          ivOpen && (
            <>
              <button className="btn" style={{ flex: 1 }} onClick={() => setIvOpen(null)}>
                Tutup
              </button>
              <button className="btn btn--primary" style={{ flex: 1 }}>
                Jadwalkan
              </button>
            </>
          )
        }
      >
        {ivOpen && <IvDetailBody iv={ivOpen} />}
      </Inspector>
    </div>
  );
}
