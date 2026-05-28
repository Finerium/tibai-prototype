"use client";

import { useState } from "react";
import { useAppTheme, type Density } from "../theme-context";

export function SettingsScreen() {
  const { theme, density, motion, setTheme, setDensity, setMotion } = useAppTheme();
  const [thresh, setThresh] = useState(75);
  const densities: Density[] = ["compact", "regular", "comfy"];

  return (
    <div className="screen">
      <div className="screen__inner" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div className="titles">
            <div className="eyebrow">Pengaturan</div>
            <h1>Preferensi konsol</h1>
          </div>
        </div>

        <section className="panel">
          <div className="panel__head">
            <h3>Tampilan</h3>
          </div>
          <div className="panel__body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="row between">
              <div className="col">
                <span style={{ fontWeight: 500, fontSize: 13 }}>Mode warna</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  Terang dan gelap keduanya didesain penuh.
                </span>
              </div>
              <div className="seg">
                <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
                  Terang
                </button>
                <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
                  Gelap
                </button>
              </div>
            </div>
            <hr className="hairline" />
            <div className="row between">
              <div className="col">
                <span style={{ fontWeight: 500, fontSize: 13 }}>Kepadatan</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  Atur ketinggian baris untuk ruang kendali.
                </span>
              </div>
              <div className="seg">
                {densities.map((d) => (
                  <button
                    key={d}
                    aria-pressed={density === d}
                    onClick={() => setDensity(d)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {d === "compact" ? "Padat" : d === "regular" ? "Standar" : "Lapang"}
                  </button>
                ))}
              </div>
            </div>
            <hr className="hairline" />
            <div className="row between">
              <div className="col">
                <span style={{ fontWeight: 500, fontSize: 13 }}>Animasi</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  Hormati prefer-reduced-motion sistem.
                </span>
              </div>
              <div className="seg">
                <button aria-pressed={motion === "on"} onClick={() => setMotion("on")}>
                  Aktif
                </button>
                <button aria-pressed={motion === "off"} onClick={() => setMotion("off")}>
                  Nonaktif
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h3>Ambang keandalan</h3>
            <span className="sub">memengaruhi penandaan koridor berisiko</span>
          </div>
          <div className="panel__body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="th">Ambang skor berisiko</label>
              <div className="row" style={{ gap: 14 }}>
                <input
                  id="th"
                  type="range"
                  min="50"
                  max="90"
                  value={thresh}
                  onChange={(e) => setThresh(+e.target.value)}
                  style={{ flex: 1, accentColor: "var(--accent)" }}
                />
                <span className="mono" style={{ width: 36, textAlign: "right", fontSize: 15 }}>
                  {thresh}
                </span>
              </div>
              <span className="hint">Koridor dengan skor di bawah {thresh} ditandai berisiko pada peta dan KPI.</span>
            </div>
            <div className="field" style={{ maxWidth: 280 }}>
              <label htmlFor="loc">Bahasa antarmuka</label>
              <select id="loc" className="input" defaultValue="id">
                <option value="id">Bahasa Indonesia (utama)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="field" style={{ maxWidth: 280, opacity: 0.55 }}>
              <label htmlFor="api">Kunci API integrasi (terkunci)</label>
              <input id="api" className="input" disabled value="••••••••••••  dikelola admin" readOnly />
              <span className="hint">Hanya admin DISHUB yang dapat mengubah.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
