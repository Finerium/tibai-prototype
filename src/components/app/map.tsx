"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import type { Corridor } from "@/lib/data";

/* hand-placed routes over a north(top)=coast / south(bottom) geography */
const ROUTES: Record<string, string[]> = {
  "mrt-ns": ["520,252", "528,290", "548,320", "500,360", "478,408", "452,470", "432,548"],
  "tj-1": ["520,72", "522,130", "528,196", "536,252", "520,300", "486,356", "470,432"],
  "tj-6": ["560,300", "566,372", "560,452", "556,524", "560,584"],
  "lrt-j": ["820,120", "824,190", "812,250", "820,300"],
  "krl-bog": ["520,72", "560,150", "598,240", "612,318", "636,420", "652,520", "660,602"],
  "tj-13": ["300,540", "364,500", "428,448", "486,406", "512,398"],
  "krl-tng": ["380,252", "300,250", "224,242", "120,232"],
};

const IX_NODES = [
  { id: "dukuh-atas", x: 548, y: 308, label: "Dukuh Atas", big: true },
  { id: "manggarai", x: 612, y: 318, label: "Manggarai", big: false },
  { id: "harmoni", x: 512, y: 196, label: "Harmoni", big: false },
  { id: "blok-m", x: 470, y: 432, label: "Blok M", big: false },
];

export function MapCanvas({
  corridors,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
}: {
  corridors: Corridor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const [layer, setLayer] = useState<"div" | "seq">("div");
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);

  const seqColor = (s: number) =>
    s >= 90 ? "var(--seq-5)" : s >= 80 ? "var(--seq-4)" : s >= 70 ? "var(--seq-3)" : s >= 55 ? "var(--seq-2)" : "var(--seq-1)";
  const divColor = (s: number) =>
    s >= 88 ? "var(--div-pos-2)" : s >= 75 ? "var(--div-pos-1)" : s >= 65 ? "var(--div-neg-1)" : "var(--div-neg-2)";
  const colorFor = (c: Corridor) => (layer === "seq" ? seqColor(c.score) : divColor(c.score));

  const blocks = useMemo(() => {
    let s = 20250529;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const out: { x: number; y: number; w: number; h: number; o: number }[] = [];
    for (let i = 0; i < 46; i++) {
      out.push({ x: 40 + r() * 880, y: 40 + r() * 540, w: 24 + r() * 60, h: 18 + r() * 44, o: 0.4 + r() * 0.5 });
    }
    return out;
  }, []);

  return (
    <div className="map-wrap" role="application" aria-label="Peta jaringan transit Jakarta">
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice">
        <g
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "520px 320px",
            transition: "transform var(--dur-slow) var(--ease)",
          }}
        >
          <rect x="0" y="0" width="1000" height="640" fill="var(--map-land)" />
          {blocks.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="var(--map-block)" opacity={b.o * 0.5} />
          ))}
          {/* Ciliwung river, subtle band */}
          <path
            d="M 470 -10 C 520 120, 470 220, 560 320 S 640 520, 600 660"
            fill="none"
            stroke="var(--map-water)"
            strokeWidth="22"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path d="M 60 360 H 940" stroke="var(--map-road)" strokeWidth="2" opacity="0.6" />
          <path d="M 540 30 V 610" stroke="var(--map-road)" strokeWidth="2" opacity="0.5" />

          {corridors.map((c) => {
            const pts = ROUTES[c.id];
            if (!pts) return null;
            const isSel = selectedId === c.id;
            const isHov = hoveredId === c.id;
            const dim = (selectedId && !isSel) || (hoveredId && !isHov && !isSel);
            const col = colorFor(c);
            return (
              <g key={c.id}>
                <polyline
                  className="corridor-hit"
                  points={pts.join(" ")}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="18"
                  onClick={() => onSelect(c.id)}
                  onMouseEnter={() => onHover(c.id)}
                  onMouseLeave={() => onHover(null)}
                />
                {isSel && (
                  <polyline
                    points={pts.join(" ")}
                    fill="none"
                    stroke={col}
                    strokeWidth="11"
                    opacity="0.22"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                <polyline
                  className={"corridor-line" + (dim ? " dim" : "")}
                  points={pts.join(" ")}
                  fill="none"
                  stroke={col}
                  strokeWidth={isSel ? 5.5 : isHov ? 5 : 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
                {pts.map((p, i) => {
                  const [x, y] = p.split(",").map(Number);
                  return (
                    <circle
                      key={i}
                      className="station-dot"
                      cx={x}
                      cy={y}
                      r={isSel || isHov ? 2.6 : 2}
                      fill="var(--bg-0)"
                      stroke={col}
                      strokeWidth="1.4"
                      pointerEvents="none"
                    />
                  );
                })}
              </g>
            );
          })}

          {IX_NODES.map((n) => (
            <g key={n.id} className="ix-node" onClick={() => onSelect("ix:" + n.id)}>
              <rect
                x={n.x - (n.big ? 7 : 5)}
                y={n.y - (n.big ? 7 : 5)}
                width={n.big ? 14 : 10}
                height={n.big ? 14 : 10}
                rx="2"
                fill="var(--bg-0)"
                stroke="var(--text-0)"
                strokeWidth={n.big ? 2.4 : 1.8}
                transform={`rotate(45 ${n.x} ${n.y})`}
              />
              {n.big && (
                <rect
                  x={n.x - 3}
                  y={n.y - 3}
                  width="6"
                  height="6"
                  fill="var(--accent)"
                  transform={`rotate(45 ${n.x} ${n.y})`}
                />
              )}
            </g>
          ))}

          {showLabels &&
            IX_NODES.map((n) => (
              <text
                key={n.id}
                className="ix-label"
                x={n.x + 12}
                y={n.y + 4}
                fontSize={n.big ? 13 : 11}
                fontWeight={n.big ? 600 : 400}
                fill={n.big ? "var(--text-0)" : "var(--text-1)"}
              >
                {n.label}
              </text>
            ))}
        </g>
      </svg>

      <div className="map-overlay map-toolbar">
        <button className="map-chip" aria-pressed={layer === "div"} onClick={() => setLayer("div")}>
          <Icon name="target" size={13} /> Terhadap target
        </button>
        <button className="map-chip" aria-pressed={layer === "seq"} onClick={() => setLayer("seq")}>
          <Icon name="layers" size={13} /> Skor keandalan
        </button>
        <button className="map-chip" aria-pressed={showLabels} onClick={() => setShowLabels((v) => !v)}>
          <Icon name="pin" size={13} /> Label
        </button>
      </div>

      <div className="map-overlay map-zoom">
        <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))} aria-label="Perbesar">
          <Icon name="plus" size={15} />
        </button>
        <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} aria-label="Perkecil">
          <Icon name="minus" size={15} />
        </button>
      </div>

      <div className="map-overlay map-legend">
        <div className="lt">{layer === "seq" ? "Skor keandalan" : "Terhadap target 75"}</div>
        {layer === "seq" ? (
          <>
            <div className="legend-scale">
              {["--seq-1", "--seq-2", "--seq-3", "--seq-4", "--seq-5"].map((v) => (
                <span key={v} className="sw" style={{ background: `var(${v})` }} />
              ))}
            </div>
            <div className="legend-ends">
              <span>40</span>
              <span>96</span>
            </div>
          </>
        ) : (
          <>
            <div className="legend-scale">
              {["--div-neg-2", "--div-neg-1", "--div-mid", "--div-pos-1", "--div-pos-2"].map((v) => (
                <span key={v} className="sw" style={{ background: `var(${v})` }} />
              ))}
            </div>
            <div className="legend-ends">
              <span>di bawah</span>
              <span>di atas</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
