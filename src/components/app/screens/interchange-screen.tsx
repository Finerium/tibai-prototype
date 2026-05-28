"use client";

import { useState } from "react";
import { Icon, Trend } from "../icons";
import { useAppNav } from "../use-nav";
import { interchange, modeIcon, type Interchange } from "@/lib/data";

function StackedSchedule({ ix, win, applied }: { ix: Interchange; win: number; applied: boolean }) {
  const ticks = [0, 7, 14, 21, 28];
  return (
    <div>
      <div className="sched">
        {ix.modes.map((m) => {
          const offset = applied ? ix.recommended[m.id] : 0;
          return (
            <div className="sched-row" key={m.id}>
              <div className="lab">
                <span className="dot" style={{ width: 9, height: 9, borderRadius: 2, background: m.color }} />
                <div className="col" style={{ gap: 0 }}>
                  <span className="mname" style={{ fontSize: 12 }}>
                    {m.mode}
                  </span>
                  <span className="muted mono" style={{ fontSize: 10 }}>
                    tiap {m.headway}m{offset ? ` · ${offset > 0 ? "+" : ""}${offset}m` : ""}
                  </span>
                </div>
              </div>
              <div className="sched-track">
                {ticks.map((t, i) => (
                  <span key={i} className="gridline" style={{ left: (t / win) * 100 + "%" }} />
                ))}
                {applied &&
                  m.arrivals.map((a, i) => (
                    <span
                      key={"g" + i}
                      className="arr-tick ghost"
                      style={{ left: (Math.min(win, a) / win) * 100 + "%", background: m.color }}
                    />
                  ))}
                {m.arrivals.map((a, i) => {
                  const pos = a + offset;
                  if (pos < 0 || pos > win) return null;
                  return (
                    <span key={i} className="arr-tick" style={{ left: (pos / win) * 100 + "%", background: m.color }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sched-axis" style={{ marginTop: 8 }}>
        <div />
        <div className="ticks">
          {ticks.map((t, i) => (
            <span key={i}>+{t}m</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransferDist({ dist }: { dist: Interchange["transferDist"] }) {
  const max = Math.max(...dist.current.map((d) => d.p), ...dist.optimised.map((d) => d.p));
  return (
    <div>
      <div className="dist">
        {dist.optimised.map((d, i) => {
          const cur = dist.current[i] || { p: 0 };
          return (
            <div className="bar" key={i} title={`${d.m} menit`}>
              <span className="b-cur" style={{ height: (cur.p / max) * 110 + "px" }} />
              <span className="b-opt" style={{ height: (d.p / max) * 110 + "px" }} />
            </div>
          );
        })}
      </div>
      <div className="dist-axis">
        {dist.optimised.map((d, i) => (
          <span key={i}>{d.m}</span>
        ))}
      </div>
      <div className="muted mono" style={{ fontSize: 10.5, textAlign: "center", marginTop: 4 }}>
        menit waktu transfer
      </div>
    </div>
  );
}

export function InterchangeScreen({ id }: { id: string }) {
  const navigate = useAppNav();
  const ix = interchange;
  const [applied, setApplied] = useState(true);
  const WIN = 28;

  if (id !== "dukuh-atas") {
    return (
      <div className="screen">
        <div className="screen__inner">
          <div className="page-head">
            <div className="titles">
              <div className="crumbs">
                <button onClick={() => navigate("operator")}>Operasi</button>
                <Icon name="chevronRight" size={13} />
                <span>Simpul</span>
              </div>
              <h1>Simpul transfer</h1>
            </div>
          </div>
          <section className="panel">
            <div className="state-block">
              <div className="ico">
                <Icon name="shuffle" size={28} />
              </div>
              <h3>Simpul belum dimodelkan</h3>
              <p>
                Detail sinkronisasi transfer untuk simpul ini belum tersedia. Dukuh Atas adalah simpul percontohan
                yang dimodelkan penuh.
              </p>
              <button className="btn btn--sm btn--primary" style={{ marginTop: 4 }} onClick={() => navigate("interchange")}>
                Buka Dukuh Atas <Icon name="arrowRight" size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen__inner">
        <div className="page-head">
          <div className="titles">
            <div className="crumbs">
              <button onClick={() => navigate("operator")}>Operasi</button>
              <Icon name="chevronRight" size={13} />
              <span>Simpul</span>
            </div>
            <h1>{ix.name}</h1>
            <div className="wrap-gap" style={{ marginTop: 4 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                {ix.sub}
              </span>
              {ix.modes.map((m) => (
                <span key={m.id} className="pill pill--neutral">
                  <Icon name={modeIcon[m.mode]} size={12} /> {m.mode}
                </span>
              ))}
            </div>
          </div>
          <div className="spacer" />
          <div className="head-actions">
            <div className="sim-toggle">
              <button aria-pressed={!applied} onClick={() => setApplied(false)}>
                Jadwal kini
              </button>
              <button aria-pressed={applied} onClick={() => setApplied(true)}>
                Offset disarankan
              </button>
            </div>
          </div>
        </div>

        <div className="kpi-strip kpi-B" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <div className="kpi">
            <div className="kpi-label">Keberhasilan transfer</div>
            <div className="kpi-val">
              <span className="v">{applied ? ix.successOptimised : ix.successCurrent}</span>
              <span className="u">%</span>
            </div>
            <div className="kpi-foot">
              {applied && <Trend value={+(ix.successOptimised - ix.successCurrent)} suffix="%" />}
              <span className="kpi-sub">{applied ? "dengan offset disarankan" : "konfigurasi jadwal saat ini"}</span>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Buffer transfer median</div>
            <div className="kpi-val">
              <span className="v">{applied ? "4.0" : "6.2"}</span>
              <span className="u">mnt</span>
            </div>
            <div className="kpi-foot">
              {applied && <Trend value={-2.2} invert suffix="m" />}
              <span className="kpi-sub">di bawah ketidakpastian</span>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Moda tersinkron</div>
            <div className="kpi-val">
              <span className="v">{applied ? 4 : 2}</span>
              <span className="u">/ 4</span>
            </div>
            <div className="kpi-foot">
              <span className="kpi-sub">pasangan dengan buffer aman</span>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Penyesuaian disarankan</div>
            <div className="kpi-val">
              <span className="v">3</span>
            </div>
            <div className="kpi-foot">
              <span className="kpi-sub">geseran offset ≤ 2 menit</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "var(--gap)", alignItems: "start" }}>
          <section className="panel">
            <div className="panel__head">
              <h3>Jadwal kedatangan bertumpuk</h3>
              <span className="sub">
                jendela {WIN} menit · {applied ? "offset disarankan (bayangan = kini)" : "konfigurasi kini"}
              </span>
            </div>
            <div className="panel__body">
              <StackedSchedule ix={ix} win={WIN} applied={applied} />
            </div>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h3>Distribusi waktu transfer</h3>
              <span className="sub">kini vs optimal</span>
            </div>
            <div className="panel__body">
              <TransferDist dist={ix.transferDist} />
              <div className="chart-legend" style={{ marginTop: 14 }}>
                <span className="ci">
                  <span className="swl" style={{ background: "var(--accent)" }} />
                  Optimal
                </span>
                <span className="ci">
                  <span className="swl" style={{ background: "transparent", border: "1px solid var(--line-strong)" }} />
                  Kini
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel__head">
            <h3>Penyesuaian jadwal & buffer disarankan</h3>
            <span className="sub">di bawah ketidakpastian kedatangan</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Pasangan transfer</th>
                <th className="num">Buffer kini</th>
                <th className="num">Disarankan</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {ix.recommendedBuffers.map((b, i) => (
                <tr key={i}>
                  <td>{b.pair}</td>
                  <td className="num">{b.current.toFixed(1)}m</td>
                  <td className="num" style={{ color: "var(--ok)" }}>
                    {b.rec.toFixed(1)}m
                  </td>
                  <td className="muted">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
