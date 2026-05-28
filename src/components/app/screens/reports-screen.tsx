"use client";

import { useState } from "react";
import { Icon } from "../icons";

export function ReportsScreen() {
  const [state, setState] = useState<"data" | "empty" | "error" | "loading">("data");

  const rows = [
    { name: "Keandalan mingguan, seluruh koridor", period: "19-25 Mei 2026", at: "26 Mei 06:00", status: "ok" },
    { name: "Sinkronisasi transfer, Dukuh Atas", period: "Mei 2026", at: "25 Mei 22:10", status: "ok" },
    { name: "Dampak intervensi, K6 prioritas sinyal", period: "Q2 2026", at: "24 Mei 14:32", status: "ok" },
    { name: "Audit ketidakandalan, K13 layang", period: "20-26 Mei 2026", at: "menyusun…", status: "loading" },
  ];

  return (
    <div className="screen">
      <div className="screen__inner">
        <div className="page-head">
          <div className="titles">
            <div className="eyebrow">Laporan · DISHUB DKI Jakarta</div>
            <h1>Laporan keandalan</h1>
          </div>
          <div className="spacer" />
          <div className="head-actions">
            <div className="seg" style={{ height: 30 }}>
              {(["data", "loading", "empty", "error"] as const).map((s) => (
                <button
                  key={s}
                  aria-pressed={state === s}
                  onClick={() => setState(s)}
                  style={{ height: 26, fontSize: 11, textTransform: "capitalize" }}
                >
                  {s === "data" ? "Isi" : s === "loading" ? "Memuat" : s === "empty" ? "Kosong" : "Galat"}
                </button>
              ))}
            </div>
            <button className="btn btn--sm btn--primary">
              <Icon name="plus" size={14} /> Buat laporan
            </button>
          </div>
        </div>

        <section className="panel">
          <div className="panel__head">
            <h3>Tersimpan</h3>
            <span className="sub">{state === "data" ? rows.length + " laporan" : ""}</span>
          </div>

          {state === "loading" && (
            <div className="panel__body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="row" style={{ gap: 14 }}>
                  <span className="skel" style={{ height: 13, flex: 2 }} />
                  <span className="skel" style={{ height: 13, flex: 1 }} />
                  <span className="skel" style={{ height: 13, width: 90 }} />
                </div>
              ))}
            </div>
          )}

          {state === "empty" && (
            <div className="state-block">
              <div className="ico">
                <Icon name="inbox" size={28} />
              </div>
              <h3>Belum ada laporan</h3>
              <p>
                Laporan keandalan yang Anda buat akan muncul di sini. Mulai dari ringkasan mingguan seluruh koridor.
              </p>
              <button className="btn btn--sm btn--primary" style={{ marginTop: 4 }}>
                <Icon name="plus" size={14} /> Buat laporan pertama
              </button>
            </div>
          )}

          {state === "error" && (
            <div className="state-block state-block--error">
              <div className="ico">
                <Icon name="offline" size={28} />
              </div>
              <h3>Gagal memuat laporan</h3>
              <p>Layanan laporan tidak merespons. Periksa koneksi ke pusat data DISHUB lalu coba lagi.</p>
              <button className="btn btn--sm" style={{ marginTop: 4 }} onClick={() => setState("data")}>
                <Icon name="refresh" size={14} /> Coba lagi
              </button>
            </div>
          )}

          {state === "data" && (
            <table className="table">
              <thead>
                <tr>
                  <th>Laporan</th>
                  <th>Periode</th>
                  <th>Dibuat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td className="muted">{r.period}</td>
                    <td className="mono muted">{r.at}</td>
                    <td>
                      {r.status === "ok" ? (
                        <span className="pill pill--ok">
                          <Icon name="check" size={12} /> Siap
                        </span>
                      ) : (
                        <span className="pill pill--neutral">
                          <span className="skel" style={{ width: 9, height: 9, borderRadius: "50%" }} /> Menyusun
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
