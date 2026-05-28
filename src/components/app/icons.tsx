import type { CSSProperties } from "react";

/* Original stroke-based icon set, 1.6px, viewBox 24. */
const ICON_PATHS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  command:
    '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z"/><path d="M13.5 20a2 2 0 0 1-3 0"/>',
  activity: '<path d="M3 12h4l2.5-7 5 14 2.5-7H21"/>',
  route:
    '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.5"/>',
  shuffle:
    '<path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7M16 21h5v-5M21 21 14.5 14.5M8 3H3v5M3 3l6.5 6.5"/>',
  report: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h6M9 9h2"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  external:
    '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  play: '<path d="M7 5v14l11-7z"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  sliders:
    '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  inbox:
    '<path d="M4 13h4l1.5 3h5L16 13h4"/><path d="M5 13 7 5h10l2 8v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
  offline: '<path d="M2 4 22 22"/><path d="M8.5 9.5A8 8 0 0 1 19 11M5 12.5A12 12 0 0 1 8 10M12 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  train:
    '<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 16l-2 4M15 16l2 4"/><path d="M8.5 7.5h7"/>',
  bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M8 17v3M16 17v3"/><circle cx="8" cy="14" r="0.6"/><circle cx="16" cy="14" r="0.6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/>',
};

export interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, stroke = 1.6, className = "", style }: IconProps) {
  const d = ICON_PATHS[name] || "";
  return (
    <svg
      className={"icon " + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}

export function Trend({
  value,
  invert = false,
  suffix = "",
}: {
  value: number;
  invert?: boolean;
  suffix?: string;
}) {
  if (value === 0) return <span className="trend trend--flat num">±0{suffix}</span>;
  const up = value > 0;
  const good = invert ? !up : up;
  return (
    <span className={"trend num " + (good ? "trend--good" : "trend--bad")}>
      <Icon name={up ? "arrowUp" : "arrowDown"} size={12} stroke={2} />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function StatusDot({
  status,
  label,
  round = true,
}: {
  status: string;
  label: string;
  round?: boolean;
}) {
  const map: Record<string, string> = {
    ok: "status--ok",
    warn: "status--warn",
    alert: "status--alert",
    neutral: "status--neutral",
  };
  return (
    <span className={"status " + (map[status] || map.neutral)}>
      <span className={"dot" + (round ? " round" : "")} />
      {label}
    </span>
  );
}

export function Spark({
  data,
  w = 64,
  h = 22,
  invert = false,
}: {
  data: number[];
  w?: number;
  h?: number;
  invert?: boolean;
}) {
  const min = Math.min(...data),
    max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 2 - ((v - min) / rng) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = data[data.length - 1],
    first = data[0];
  const rising = last >= first;
  const good = invert ? !rising : rising;
  const col = good ? "var(--ok)" : "var(--alert)";
  const [lx, ly] = pts[pts.length - 1].split(",");
  return (
    <svg width={w} height={h} className="spark" aria-hidden="true">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={col}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lx} cy={ly} r="2" fill={col} />
    </svg>
  );
}
