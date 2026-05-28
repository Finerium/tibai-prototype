/* ============================================================
   Tiba data layer: real Jakarta network, plausible invented
   numbers. Mock only, no backend. Ported from the dashboard
   handoff bundle and typed.
   ============================================================ */

export type Mode = "BRT" | "MRT" | "LRT" | "KRL";
export type Status = "ok" | "warn" | "alert" | "neutral";
export type BandLabel = "on-time" | "at-risk" | "disrupted";
export type Effort = "rendah" | "sedang" | "tinggi";

export interface BandPoint {
  t: number;
  p50: number;
  p10: number;
  p90: number;
  conf: number;
}

export interface BandOptions {
  spread?: number;
  drift?: number;
  start?: number;
}

export interface Cause {
  k: string;
  v: number;
  note: string;
}

export interface Segment {
  name: string;
  conf: number;
}

export interface Corridor {
  id: string;
  code: string;
  mode: Mode;
  name: string;
  score: number;
  band: BandLabel;
  status: Exclude<Status, "neutral">;
  trend: number;
  stations: number;
  lengthKm: number;
  p10: number;
  p50: number;
  p90: number;
  headwayMin: number;
  ridership: string;
  seed: number;
  spread: number;
  drift: number;
  seg: Segment[];
  causes: Cause[];
}

export interface Intervention {
  id: string;
  corridor: string;
  title: string;
  impact: number;
  effort: Effort;
  confidence: number;
  dim: string;
  detail: string;
}

export interface InterchangeMode {
  id: string;
  label: string;
  mode: Mode;
  color: string;
  headway: number;
  arrivals: number[];
  offset: number;
}

export interface RecommendedBuffer {
  pair: string;
  current: number;
  rec: number;
  note: string;
}

export interface Interchange {
  id: string;
  name: string;
  sub: string;
  modes: InterchangeMode[];
  recommended: Record<string, number>;
  transferDist: {
    current: { m: number; p: number }[];
    optimised: { m: number; p: number }[];
  };
  recommendedBuffers: RecommendedBuffer[];
  successCurrent: number;
  successOptimised: number;
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  hero?: boolean;
  invert?: boolean;
  sub: string;
  spark: number[];
}

// deterministic pseudo-random so series are stable across renders
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Build a P10/P50/P90 arrival-deviation series (minutes from schedule).
 * Confidence dips in two rush windows, widening the band.
 */
export function band(seed: number, n: number, opts: BandOptions = {}): BandPoint[] {
  const r = seeded(seed);
  const baseSpread = opts.spread != null ? opts.spread : 2.4;
  const drift = opts.drift != null ? opts.drift : 0;
  const pts: BandPoint[] = [];
  let center = opts.start != null ? opts.start : 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const rushA = Math.exp(-Math.pow((t - 0.3) / 0.1, 2));
    const rushB = Math.exp(-Math.pow((t - 0.74) / 0.12, 2));
    const rush = Math.max(rushA, rushB);
    center += (r() - 0.5) * 0.7 + drift / n;
    const spread = baseSpread * (0.55 + rush * 1.6) + r() * 0.5;
    const conf = Math.max(0.18, 1 - rush * 0.78 - r() * 0.08);
    pts.push({
      t,
      p50: center,
      p10: center - spread * (0.85 + r() * 0.3),
      p90: center + spread * (0.95 + r() * 0.35),
      conf,
    });
  }
  return pts;
}

export const corridors: Corridor[] = [
  {
    id: "tj-1", code: "TJ K1", mode: "BRT", name: "Koridor 1: Blok M - Kota",
    score: 91, band: "on-time", status: "ok", trend: +1.4, stations: 20, lengthKm: 12.9,
    p10: -2, p50: +1, p90: +6, headwayMin: 4, ridership: "tinggi",
    seed: 11, spread: 1.8, drift: -2,
    seg: [
      { name: "Blok M - Masjid Agung", conf: 0.92 },
      { name: "Bundaran Senayan - Tosari", conf: 0.74 },
      { name: "Dukuh Atas - Harmoni", conf: 0.55 },
      { name: "Sawah Besar - Kota", conf: 0.83 },
    ],
    causes: [
      { k: "Varians waktu henti (dwell)", v: 38, note: "Halte Harmoni, Tosari" },
      { k: "Paparan lalu lintas campuran", v: 26, note: "Segmen Sawah Besar" },
      { k: "Penyimpangan headway", v: 21, note: "Jam puncak pagi" },
      { k: "Penumpukan transfer", v: 15, note: "Dukuh Atas" },
    ],
  },
  {
    id: "mrt-ns", code: "MRT NS", mode: "MRT", name: "Lin Utara-Selatan: Lebak Bulus - Bundaran HI",
    score: 96, band: "on-time", status: "ok", trend: +0.3, stations: 13, lengthKm: 15.7,
    p10: -1, p50: 0, p90: +2, headwayMin: 5, ridership: "tinggi",
    seed: 23, spread: 0.9, drift: 0,
    seg: [
      { name: "Lebak Bulus - Fatmawati", conf: 0.96 },
      { name: "Blok M - ASEAN", conf: 0.93 },
      { name: "Senayan - Setiabudi", conf: 0.88 },
      { name: "Dukuh Atas - Bundaran HI", conf: 0.9 },
    ],
    causes: [
      { k: "Varians waktu henti (dwell)", v: 44, note: "Bundaran HI" },
      { k: "Penyimpangan headway", v: 31, note: "Singkronisasi sinyal" },
      { k: "Penumpukan transfer", v: 17, note: "Dukuh Atas BNI" },
      { k: "Lainnya", v: 8, note: "" },
    ],
  },
  {
    id: "tj-6", code: "TJ K6", mode: "BRT", name: "Koridor 6: Ragunan - Dukuh Atas",
    score: 73, band: "at-risk", status: "warn", trend: -3.1, stations: 16, lengthKm: 13.3,
    p10: -3, p50: +4, p90: +14, headwayMin: 6, ridership: "sedang",
    seed: 37, spread: 3.2, drift: 5,
    seg: [
      { name: "Ragunan - Kuningan", conf: 0.7 },
      { name: "Kuningan - Karet", conf: 0.41 },
      { name: "Karet - Dukuh Atas", conf: 0.36 },
    ],
    causes: [
      { k: "Paparan lalu lintas campuran", v: 41, note: "Mampang - Kuningan" },
      { k: "Penyimpangan headway", v: 27, note: "Sore hari" },
      { k: "Varians waktu henti (dwell)", v: 19, note: "Halte Kuningan" },
      { k: "Penumpukan transfer", v: 13, note: "Dukuh Atas" },
    ],
  },
  {
    id: "lrt-j", code: "LRT J", mode: "LRT", name: "LRT Jakarta: Pegangsaan Dua - Velodrome",
    score: 88, band: "on-time", status: "ok", trend: +0.9, stations: 6, lengthKm: 5.8,
    p10: -1, p50: +1, p90: +3, headwayMin: 7, ridership: "rendah",
    seed: 51, spread: 1.3, drift: 0,
    seg: [
      { name: "Pegangsaan Dua - Boulevard", conf: 0.9 },
      { name: "Boulevard - Velodrome", conf: 0.85 },
    ],
    causes: [
      { k: "Penyimpangan headway", v: 39, note: "Frekuensi rendah" },
      { k: "Varians waktu henti (dwell)", v: 33, note: "Velodrome" },
      { k: "Lainnya", v: 28, note: "" },
    ],
  },
  {
    id: "krl-bog", code: "KRL B", mode: "KRL", name: "KRL Lin Bogor: Jakarta Kota - Bogor",
    score: 64, band: "at-risk", status: "warn", trend: -1.7, stations: 24, lengthKm: 54.8,
    p10: -4, p50: +6, p90: +19, headwayMin: 10, ridership: "tinggi",
    seed: 67, spread: 4.0, drift: 7,
    seg: [
      { name: "Jakarta Kota - Manggarai", conf: 0.6 },
      { name: "Manggarai - Depok", conf: 0.38 },
      { name: "Depok - Bogor", conf: 0.52 },
    ],
    causes: [
      { k: "Penyimpangan headway", v: 36, note: "Manggarai switching" },
      { k: "Paparan persilangan sebidang", v: 28, note: "Lenteng Agung" },
      { k: "Varians waktu henti (dwell)", v: 22, note: "Manggarai" },
      { k: "Cuaca / lainnya", v: 14, note: "" },
    ],
  },
  {
    id: "tj-13", code: "TJ K13", mode: "BRT", name: "Koridor 13: Ciledug - Tendean (layang)",
    score: 41, band: "disrupted", status: "alert", trend: -8.2, stations: 12, lengthKm: 9.3,
    p10: -2, p50: +11, p90: +31, headwayMin: 8, ridership: "sedang",
    seed: 83, spread: 5.6, drift: 12,
    seg: [
      { name: "Ciledug - Adam Malik", conf: 0.34 },
      { name: "Adam Malik - Tendean", conf: 0.22 },
    ],
    causes: [
      { k: "Insiden / penutupan jalur", v: 47, note: "Perbaikan struktur layang" },
      { k: "Penyimpangan headway", v: 24, note: "Armada dialihkan" },
      { k: "Paparan lalu lintas campuran", v: 18, note: "Tendean" },
      { k: "Varians waktu henti (dwell)", v: 11, note: "" },
    ],
  },
  {
    id: "krl-tng", code: "KRL T", mode: "KRL", name: "KRL Lin Tangerang: Duri - Tangerang",
    score: 79, band: "on-time", status: "ok", trend: +2.2, stations: 11, lengthKm: 19.3,
    p10: -2, p50: +2, p90: +8, headwayMin: 12, ridership: "sedang",
    seed: 97, spread: 2.2, drift: 1,
    seg: [
      { name: "Duri - Grogol", conf: 0.82 },
      { name: "Grogol - Batuceper", conf: 0.7 },
      { name: "Batuceper - Tangerang", conf: 0.76 },
    ],
    causes: [
      { k: "Penyimpangan headway", v: 42, note: "Frekuensi" },
      { k: "Varians waktu henti (dwell)", v: 29, note: "Duri" },
      { k: "Paparan persilangan sebidang", v: 19, note: "Poris" },
      { k: "Lainnya", v: 10, note: "" },
    ],
  },
];

// ranked interventions across the network (operator console)
export const interventions: Intervention[] = [
  {
    id: "iv1", corridor: "tj-13", title: "Pulihkan headway 6 menit, K13 sore", impact: +14,
    effort: "sedang", confidence: 0.72, dim: "headway",
    detail:
      "Tambah 3 armada cadangan 16:00-19:00 untuk menutup celah selama perbaikan struktur layang.",
  },
  {
    id: "iv2", corridor: "tj-6", title: "Prioritas sinyal Mampang - Kuningan", impact: +9,
    effort: "tinggi", confidence: 0.58, dim: "traffic",
    detail:
      "Transit signal priority di 4 persimpangan menurunkan paparan lalu lintas campuran pada segmen kepercayaan terendah.",
  },
  {
    id: "iv3", corridor: "krl-bog", title: "Buffer transfer +90 detik di Manggarai", impact: +7,
    effort: "rendah", confidence: 0.81, dim: "transfer",
    detail: "Geser offset jadwal agar kedatangan Lin Bogor tidak bertumpuk saat switching peron.",
  },
  {
    id: "iv4", corridor: "tj-6", title: "Batasi dwell Halte Kuningan ke 40 detik", impact: +5,
    effort: "rendah", confidence: 0.77, dim: "dwell",
    detail: "Pintu ganda + petugas peron pada jam puncak menurunkan varians waktu henti.",
  },
  {
    id: "iv5", corridor: "krl-bog", title: "Tinjau ulang persilangan Lenteng Agung", impact: +4,
    effort: "tinggi", confidence: 0.49, dim: "traffic",
    detail: "Studi kelayakan underpass; dampak besar namun horizon panjang.",
  },
];

// Dukuh Atas interchange: the exemplar
export const interchange: Interchange = {
  id: "dukuh-atas",
  name: "Dukuh Atas",
  sub: "Simpul transfer empat moda",
  modes: [
    { id: "mrt", label: "MRT Dukuh Atas BNI", mode: "MRT", color: "var(--seq-5)", headway: 5, arrivals: [2, 7, 12, 17, 22, 27], offset: 0 },
    { id: "tj", label: "TransJakarta Dukuh Atas", mode: "BRT", color: "var(--seq-4)", headway: 4, arrivals: [1, 5, 9, 13, 17, 21, 25], offset: 0 },
    { id: "krl", label: "KRL Sudirman / BNI City", mode: "KRL", color: "var(--seq-3)", headway: 10, arrivals: [4, 14, 24], offset: 0 },
    { id: "lrt", label: "LRT Dukuh Atas", mode: "LRT", color: "var(--seq-2)", headway: 7, arrivals: [3, 10, 17, 24], offset: 0 },
  ],
  recommended: { mrt: 0, tj: -1, krl: +2, lrt: -1 },
  transferDist: {
    current: [
      { m: 1, p: 4 }, { m: 2, p: 9 }, { m: 3, p: 15 }, { m: 4, p: 18 }, { m: 5, p: 16 },
      { m: 6, p: 12 }, { m: 7, p: 9 }, { m: 8, p: 7 }, { m: 9, p: 5 }, { m: 10, p: 3 }, { m: 11, p: 2 },
    ],
    optimised: [
      { m: 1, p: 7 }, { m: 2, p: 17 }, { m: 3, p: 24 }, { m: 4, p: 21 }, { m: 5, p: 13 },
      { m: 6, p: 8 }, { m: 7, p: 5 }, { m: 8, p: 3 }, { m: 9, p: 1 }, { m: 10, p: 1 }, { m: 11, p: 0 },
    ],
  },
  recommendedBuffers: [
    { pair: "KRL ke MRT", current: 6.2, rec: 4.0, note: "Offset +2 menit pada KRL" },
    { pair: "TransJakarta ke MRT", current: 3.8, rec: 3.0, note: "Geser TJ -1 menit" },
    { pair: "LRT ke KRL", current: 7.1, rec: 5.5, note: "Buffer ketidakpastian tetap" },
  ],
  successCurrent: 82,
  successOptimised: 94,
};

// KPI headlines for the operator dashboard
export const kpis: Kpi[] = [
  { id: "score", label: "Skor Keandalan Sistem", value: 84.6, unit: "", trend: +1.2, hero: true, sub: "Rerata tertimbang ridership, 7 koridor aktif", spark: [80, 81, 79, 82, 83, 82, 84, 84.6] },
  { id: "ontime", label: "Pita Tepat Waktu (P50)", value: 88, unit: "%", trend: +0.6, sub: "Kedatangan dalam -2 / +5 menit", spark: [85, 86, 84, 87, 88, 87, 88, 88] },
  { id: "transfer", label: "Keberhasilan Transfer", value: 82, unit: "%", trend: -1.4, sub: "4 simpul intermoda terpantau", spark: [86, 85, 84, 83, 82, 83, 82, 82] },
  { id: "atrisk", label: "Koridor Berisiko", value: 3, unit: "", trend: +1, invert: true, sub: "Skor di bawah ambang 75", spark: [1, 2, 2, 2, 3, 2, 3, 3] },
  { id: "incident", label: "Insiden Aktif", value: 1, unit: "", trend: 0, invert: true, sub: "K13: perbaikan struktur layang", spark: [0, 0, 1, 1, 1, 1, 1, 1] },
];

export const agency = "DISHUB DKI Jakarta";

export const modeLabel: Record<Mode, string> = {
  BRT: "TransJakarta",
  MRT: "MRT Jakarta",
  LRT: "LRT Jakarta",
  KRL: "KRL Commuter",
};

export const statusLabel: Record<Status, string> = {
  ok: "Andal",
  warn: "Berisiko",
  alert: "Terganggu",
  neutral: "-",
};

export const bandLabelText: Record<BandLabel, string> = {
  "on-time": "Tepat waktu",
  "at-risk": "Berisiko",
  disrupted: "Terganggu",
};

export const modeIcon: Record<Mode, string> = {
  BRT: "bus",
  MRT: "train",
  LRT: "train",
  KRL: "train",
};

export function findCorridor(id: string): Corridor | undefined {
  return corridors.find((c) => c.id === id);
}

export const TIBA = {
  corridors,
  interventions,
  interchange,
  kpis,
  band,
  agency,
  findCorridor,
  modeLabel,
  statusLabel,
  bandLabel: bandLabelText,
};
