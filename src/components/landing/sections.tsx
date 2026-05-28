"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useLang } from "./lang";
import { Reveal, CountUp, BarFill } from "./motion";
import {
  HeroBand,
  PillarBand,
  PillarDensity,
  PillarSync,
  PillarSim,
  CorridorSchematic,
  TargetProjection,
} from "./diagrams";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ============ 1, HERO ============ */
export function Hero() {
  const { lang, t } = useLang();
  const reduce = useReducedMotion();
  // Deterministic initial state (SSR-safe). Reduced motion drops the duration
  // and stagger delay so the intro renders statically with no hydration drift.
  const fade = (i: number) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 1.0, ease: EASE_OUT, delay: reduce ? 0 : 0.15 + i * 0.12 },
  });
  return (
    <section className="hero wrap" id="hero" data-screen-label="Hero" aria-labelledby="hero-title">
      <div className="hero-top">
        <motion.span className="eyebrow" {...fade(0)}>
          {t("Pendukung keputusan · DISHUB DKI Jakarta", "Decision support · DISHUB DKI Jakarta")}
        </motion.span>
        <motion.h1 className="hero-tagline" id="hero-title" {...fade(1)}>
          {lang === "en" ? (
            <>
              Every arrival, with <em className="accent">confidence</em>.
            </>
          ) : (
            <>
              Setiap kedatangan, dengan <em className="accent">keyakinan</em>.
            </>
          )}
        </motion.h1>
        <div className="hero-sub">
          <motion.p {...fade(2)}>
            {t(
              "Tiba memprediksi keandalan kedatangan transit Jakarta sebagai rentang probabilitas, bukan satu angka ETA. Semakin lebar rentangnya, semakin rendah keyakinannya.",
              "Tiba forecasts the reliability of Jakarta's transit arrivals as probability bands, not a single ETA. Wider band, lower confidence.",
            )}
          </motion.p>
          <motion.div className="hero-meta" {...fade(3)}>
            <div>
              <b>{t("Platform pendukung keputusan", "Probabilistic decision-support platform")}</b>
            </div>
            <div>{t("P10 · P50 · P90 rentang keyakinan", "P10 · P50 · P90 confidence band")}</div>
            <div>TransJakarta · MRT · LRT · KRL</div>
          </motion.div>
        </div>
      </div>

      <HeroBand>
        <div className="viz-caption">
          <span>{t("Prediksi kedatangan · Koridor 1 (Blok M ke Kota)", "Arrival prediction · Corridor 1 (Blok M to Kota)")}</span>
          <span>{t("Keyakinan menyempit saat bus mendekat", "Confidence narrows as the bus nears")}</span>
        </div>
      </HeroBand>

      <div className="scroll-cue" aria-hidden="true">
        <span className="ln" />
        <span>{t("Gulir", "Scroll")}</span>
      </div>
    </section>
  );
}

/* ============ 2, THE PROBLEM (dark) ============ */
export function Problem() {
  const { lang, t } = useLang();
  return (
    <section className="problem on-dark section-pad" id="problem" data-screen-label="The Problem" aria-labelledby="problem-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal as="span" className="section-index">
            02 · {t("Masalah", "The problem")}
          </Reveal>
          <Reveal as="h2" id="problem-title" className="problem-statement">
            {lang === "en" ? (
              <>
                Jakarta does not have a speed problem. It has a <em>reliability</em> problem.
              </>
            ) : (
              <>
                Jakarta tidak punya masalah kecepatan. Jakarta punya masalah <em>keandalan</em>.
              </>
            )}
          </Reveal>
        </div>

        <div className="problem-grid">
          <div className="stat-major">
            <div className="stat-num">
              <CountUp className="cnum" to={100} />
              <span className="unit">{t("triliun rupiah / tahun", "trillion rupiah / year")}</span>
            </div>
            <Reveal as="p" className="stat-label">
              {t(
                "Hilang akibat kemacetan di Jabodetabek setiap tahun. Transit yang tidak andal mendorong penumpang kembali ke kendaraan pribadi.",
                "Lost to congestion across Greater Jakarta every year. Unreliable transit pushes riders back into cars.",
              )}
              <sup className="fn">1</sup>
            </Reveal>
          </div>
          <Reveal className="stat-aside">
            <div className="modeshift">
              <div className="ms-row">
                <span className="ms-year">2002</span>
                <span className="ms-bar-track">
                  <BarFill className="ms-bar-fill" to={0.577} />
                </span>
                <span className="ms-val">57,7%</span>
              </div>
              <div className="ms-row">
                <span className="ms-year">2018</span>
                <span className="ms-bar-track">
                  <BarFill className="ms-bar-fill now" to={0.088} delay={0.18} />
                </span>
                <span className="ms-val">8,8%</span>
              </div>
            </div>
            <p className="modeshift-cap">
              {t("Pangsa moda angkutan umum, Jabodetabek", "Public-transit mode share, Greater Jakarta")}
              <sup className="fn">2</sup>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============ 3, THE THESIS ============ */
export function Thesis() {
  const { lang, t } = useLang();
  return (
    <section className="section-pad" id="thesis" data-screen-label="The Thesis" aria-labelledby="thesis-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal as="span" className="section-index">
            03 · {t("Tesis", "The thesis")}
          </Reveal>
          <Reveal as="h2" id="thesis-title" className="thesis-lead">
            {lang === "en" ? (
              <>
                The lever is <em>reliability</em>, not speed.
              </>
            ) : (
              <>
                Tuasnya adalah <em>keandalan</em>, bukan kecepatan.
              </>
            )}
          </Reveal>
        </div>

        <div className="thesis-body">
          <Reveal className="thesis-copy">
            <p>
              {t(
                "Penumpang merasakan waktu menunggu jauh lebih tajam daripada waktu bergerak. Perkecil ketidakpastian menunggu, dan keputusan untuk naik transit pun berubah.",
                "Riders feel waiting far more sharply than moving. Shrink the uncertainty of waiting and you change the decision to ride at all.",
              )}
            </p>
          </Reveal>
          <div className="thesis-viz" aria-label="Value of time">
            <div className="vot">
              <div className="vot-row">
                <div className="vot-top">
                  <span className="vot-name">
                    <span className="k">{t("Waktu di dalam kendaraan", "In-vehicle time")}</span>
                  </span>
                  <span className="vot-mult">
                    <CountUp to={1} decimals={0} />
                    <span className="x">×</span>
                  </span>
                </div>
                <div className="vot-track">
                  <BarFill className="vot-fill" to={0.24} duration={1.2} />
                </div>
              </div>
              <div className="vot-row">
                <div className="vot-top">
                  <span className="vot-name">
                    <span className="k">{t("Waktu menunggu · BRT", "Wait time · BRT")}</span>
                  </span>
                  <span className="vot-mult">
                    <CountUp to={2.4} decimals={1} />
                    <span className="x">×</span>
                  </span>
                </div>
                <div className="vot-track">
                  <BarFill className="vot-fill accent-fill" to={0.57} duration={1.2} delay={0.14} />
                </div>
              </div>
              <div className="vot-row">
                <div className="vot-top">
                  <span className="vot-name">
                    <span className="k">{t("Waktu menunggu · non-BRT", "Wait time · non-BRT")}</span>
                  </span>
                  <span className="vot-mult">
                    <CountUp to={4.2} decimals={1} />
                    <span className="x">×</span>
                  </span>
                </div>
                <div className="vot-track">
                  <BarFill className="vot-fill accent-fill" to={1} duration={1.2} delay={0.28} />
                </div>
              </div>
            </div>
            <p className="diagram-cap" style={{ marginTop: "1.4rem" }}>
              {t(
                "Bagaimana penumpang menilai semenit menunggu dibanding semenit bergerak",
                "How riders value a minute of waiting versus a minute moving",
              )}
              <sup className="fn">3</sup>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 4, HOW TIBA WORKS ============ */
export function How() {
  const { lang, t } = useLang();
  return (
    <section className="section-pad" id="how" data-screen-label="How it works" aria-labelledby="how-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal as="span" className="section-index">
            04 · {t("Cara kerja Tiba", "How Tiba works")}
          </Reveal>
          <Reveal as="h2" id="how-title" className="thesis-lead">
            {lang === "en" ? (
              <>
                Four instruments for one <em>outcome</em>.
              </>
            ) : (
              <>
                Empat instrumen untuk satu <em>hasil</em>.
              </>
            )}
          </Reveal>
        </div>
      </div>
      <div className="wrap">
        <div className="pillars">
          <article className="pillar">
            <span className="pillar-no">01</span>
            <h3 className="pillar-title">{t("Prediksi keandalan probabilistik", "Probabilistic reliability prediction")}</h3>
            <p className="pillar-desc">
              {t(
                "Setiap kedatangan adalah rentang P10-P50-P90, dan satu Skor Keandalan per rute.",
                "Every arrival is a P10-P50-P90 band, and a single Reliability Score per route.",
              )}
            </p>
            <PillarBand caption={t("Skor Keandalan · 0 ke 100", "Skor Keandalan · 0 to 100")} />
          </article>

          <article className="pillar">
            <span className="pillar-no">02</span>
            <h3 className="pillar-title">{t("Prakiraan permintaan & kepadatan", "Demand & density forecasting")}</h3>
            <p className="pillar-desc">
              {t(
                "Transaksi tap-in dan tap-out menjadi prakiraan di mana kepadatan terbentuk, per jam.",
                "Tap-in and tap-out transactions become a forecast of where crowding builds, by hour.",
              )}
            </p>
            <PillarDensity caption={t("Volume tapping · 05.00 ke 22.00", "Tapping volume · 05:00 to 22:00")} />
          </article>

          <article className="pillar">
            <span className="pillar-no">03</span>
            <h3 className="pillar-title">{t("Optimasi transfer stokastik", "Stochastic transfer optimization")}</h3>
            <p className="pillar-desc">
              {t(
                "Di titik temu layanan, Tiba menggeser jadwal dan menetapkan buffer transfer di bawah ketidakpastian. Dukuh Atas adalah buktinya.",
                "Where services meet, Tiba offsets schedules and sets transfer buffers under uncertainty. Dukuh Atas is the proof.",
              )}
            </p>
            <PillarSync caption={t("TransJakarta ke MRT · buffer transfer", "TransJakarta to MRT · transfer buffer")} />
          </article>

          <article className="pillar">
            <span className="pillar-no">04</span>
            <h3 className="pillar-title">{t("Simulator koridor sebelum & sesudah", "Before-and-after corridor simulator")}</h3>
            <p className="pillar-desc">
              {t(
                "DISHUB meninjau perubahan kebijakan dan melihat pergeseran keandalan sebelum memutuskan.",
                "DISHUB previews a policy change and sees the reliability shift before committing.",
              )}
            </p>
            <PillarSim caption={t("Variansi headway · sebelum vs sesudah", "Headway variance · before vs after")} />
          </article>
        </div>
      </div>
    </section>
  );
}

/* ============ 5, FOR DISHUB ============ */
export function Dishub() {
  const { lang, t } = useLang();
  return (
    <section className="section-pad" id="dishub" data-screen-label="For DISHUB" aria-labelledby="dishub-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal as="span" className="section-index">
            05 · {t("Yang berubah untuk DISHUB", "What changes for DISHUB")}
          </Reveal>
          <Reveal as="h2" id="dishub-title" className="thesis-lead">
            {lang === "en" ? (
              <>
                From dashboards to <em>decisions</em>, ranked.
              </>
            ) : (
              <>
                Dari dasbor ke <em>keputusan</em>, terperingkat.
              </>
            )}
          </Reveal>
        </div>

        <div className="dishub-grid">
          <Reveal className="corridor-col">
            <CorridorSchematic>
              <div className="corridor-legend">
                <span>
                  <i style={{ background: "var(--ink-faint)" }} />
                  {t("Keandalan rendah", "Low reliability")}
                </span>
                <span>
                  <i style={{ background: "var(--accent)" }} />
                  {t("Keandalan tinggi", "High reliability")}
                </span>
                <span>{t("Interchange · Dukuh Atas (4 layanan)", "Interchange · Dukuh Atas (4 services)")}</span>
              </div>
            </CorridorSchematic>
          </Reveal>

          <Reveal className="interv-col">
            <div className="interv-head">
              {t("Intervensi terperingkat · dekomposisi kausal", "Ranked interventions · causal decomposition")}
            </div>
            <ol className="interv-list">
              <li className="interv-item">
                <span className="interv-rank">01</span>
                <span className="interv-name">
                  Sinkronisasi Dukuh Atas
                  <small>{t("offset jadwal, 4 layanan", "schedule offset, 4 services")}</small>
                </span>
                <span className="interv-gain accent">
                  +6,2<span className="pt">pt</span>
                </span>
              </li>
              <li className="interv-item">
                <span className="interv-rank">02</span>
                <span className="interv-name">
                  {t("Prioritas sinyal Koridor 1", "Corridor 1 signal priority")}
                  <small>{t("di 7 persimpangan", "at 7 junctions")}</small>
                </span>
                <span className="interv-gain">
                  +4,1<span className="pt">pt</span>
                </span>
              </li>
              <li className="interv-item">
                <span className="interv-rank">03</span>
                <span className="interv-name">
                  {t("Penahanan headway, jam sibuk", "Headway holding, peak")}
                  <small>{t("manajemen dwell", "dwell management")}</small>
                </span>
                <span className="interv-gain">
                  +3,4<span className="pt">pt</span>
                </span>
              </li>
              <li className="interv-item">
                <span className="interv-rank">04</span>
                <span className="interv-name">
                  {t("Buffer transfer, MRT ke KRL", "Transfer buffer, MRT to KRL")}
                  <small>{t("luar jam sibuk", "off-peak")}</small>
                </span>
                <span className="interv-gain">
                  +2,0<span className="pt">pt</span>
                </span>
              </li>
            </ol>
          </Reveal>
        </div>

        <div className="target-band">
          <Reveal className="target-copy">
            <h3>{t("Keandalan menggerakkan pangsa moda.", "Reliability moves mode share.")}</h3>
            <p>
              {t(
                "Tiba memperkirakan elastisitas dari keandalan ke jumlah penumpang, dan memetakan jalur menuju target 60% angkutan umum Jakarta pada 2030.",
                "Tiba estimates the elasticity from reliability to ridership, and maps the path toward Jakarta's 60% public-transit target for 2030.",
              )}
              <sup className="fn">4</sup>
            </p>
          </Reveal>
          <TargetProjection />
        </div>
      </div>
    </section>
  );
}

/* ============ 6, CREDIBILITY ============ */
export function Credibility() {
  const { lang, t } = useLang();
  return (
    <section className="section-pad" id="credibility" data-screen-label="Credibility" aria-labelledby="cred-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal as="span" className="section-index">
            06 · {t("Kredibilitas", "Credibility")}
          </Reveal>
          <Reveal as="h2" id="cred-title" className="thesis-lead">
            {lang === "en" ? (
              <>
                Built on what Jakarta <em>actually</em> has.
              </>
            ) : (
              <>
                Dibangun dari yang <em>benar-benar</em> dimiliki Jakarta.
              </>
            )}
          </Reveal>
        </div>

        <div className="cred-grid">
          <Reveal className="cred-block">
            <h3 className="cred-h">{t("Asal data", "Data provenance")}</h3>
            <ul className="prov-list">
              <li>
                <span className="pn">{t("GTFS TransJakarta (statis)", "TransJakarta GTFS (static)")}</span>
                <span className="pd">{t("rute, halte, headway terjadwal", "routes, stops, scheduled headways")}</span>
              </li>
              <li>
                <span className="pn">{t("Transaksi tapping", "Tapping transactions")}</span>
                <span className="pd">{t("sinyal permintaan tap-in / tap-out", "tap-in / tap-out demand signal")}</span>
              </li>
              <li>
                <span className="pn">{t("Pola historis", "Historical patterns")}</span>
                <span className="pd">{t("distribusi kedatangan & headway", "arrival & headway distributions")}</span>
              </li>
            </ul>
            <div className="honest">
              <span className="pn">{t("Diakui jujur", "Stated honestly")}</span>
              <p>
                {t(
                  "Belum ada umpan GTFS-RT publik untuk Jakarta. Tiba dirancang untuk menghasilkan keandalan dari data statis dan historis, dan siap menyerap umpan real-time begitu tersedia.",
                  "No public GTFS-RT feed exists for Jakarta. Tiba is built to deliver reliability from static and historical data, and to absorb real-time feeds the moment they arrive.",
                )}
              </p>
            </div>
          </Reveal>

          <Reveal className="cred-block">
            <h3 className="cred-h">{t("Fondasi teknis", "Technical foundations")}</h3>
            <ul className="tech-list">
              <li>
                <b>{t("Prediksi kuantil", "Quantile prediction")}</b>
                <span>{t("P10 / P50 / P90 via regresi kuantil gradient-boosted", "P10 / P50 / P90 via gradient-boosted quantile regression")}</span>
              </li>
              <li>
                <b>{t("Optimasi stokastik", "Stochastic optimization")}</b>
                <span>{t("sinkronisasi transfer di bawah ketidakpastian", "transfer synchronization under uncertainty")}</span>
              </li>
              <li>
                <b>{t("Dekomposisi kausal", "Causal decomposition")}</b>
                <span>{t("mengaitkan ketidakandalan ke pemicunya", "attributing unreliability to its drivers")}</span>
              </li>
              <li>
                <b>MapLibre GL</b>
                <span>{t("basemap kustom muted, keandalan sebagai lapisan", "muted custom basemap, reliability as a layer")}</span>
              </li>
            </ul>
          </Reveal>

          <Reveal className="cred-block">
            <h3 className="cred-h">{t("Tim", "The team")}</h3>
            <ul className="tech-list">
              <li className="team-row">
                <span className="tn">{t("Pemodelan transportasi", "Transport modeling")}</span>
                <span className="tr">{t("permintaan, jaringan, nilai waktu", "demand, network, value of time")}</span>
              </li>
              <li className="team-row">
                <span className="tn">{t("ML probabilistik", "Probabilistic ML")}</span>
                <span className="tr">{t("prakiraan kuantil, kalibrasi", "quantile forecasting, calibration")}</span>
              </li>
              <li className="team-row">
                <span className="tn">{t("Geospasial & rekayasa data", "Geospatial & data engineering")}</span>
                <span className="tr">{t("GTFS, pipeline tapping, MapLibre", "GTFS, tapping pipelines, MapLibre")}</span>
              </li>
              <li className="team-row">
                <span className="tn">{t("Sipil & kebijakan", "Civic & policy")}</span>
                <span className="tr">{t("keterlibatan DISHUB, tata kelola", "DISHUB engagement, governance")}</span>
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="refs">
          <h3>{t("Referensi", "References")}</h3>
          <ol>
            <li>
              {t(
                "BAPPENAS / JUTPI II (2019). Estimasi kerugian kemacetan tahunan, Jabodetabek.",
                "BAPPENAS / JUTPI II (2019). Estimated annual congestion losses, Greater Jakarta.",
              )}
            </li>
            <li>
              {t(
                "JUTPI II (2019). Pangsa moda angkutan umum, Jabodetabek, 2002 dan 2018.",
                "JUTPI II (2019). Public-transit mode share, Greater Jakarta, 2002 and 2018.",
              )}
            </li>
            <li>
              {t(
                "Kreindler, G. dkk. (2023). Nilai waktu menunggu vs waktu dalam kendaraan. NBER Working Paper.",
                "Kreindler, G. et al. (2023). Value of waiting vs in-vehicle time. NBER Working Paper.",
              )}
            </li>
            <li>
              {t(
                "Rencana induk transportasi Jakarta. Target: 60% pangsa angkutan umum pada 2030.",
                "Jakarta transport master plan. Target: 60% public-transit mode share by 2030.",
              )}
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ============ 7, CTA + FOOTER ============ */
export function Cta() {
  const { lang, setLang, t } = useLang();
  return (
    <>
      <section className="cta on-dark section-pad" id="cta" data-screen-label="CTA" aria-labelledby="cta-title">
        <div className="wrap">
          <Reveal as="span" className="section-index" style={{ marginBottom: "1.4rem", display: "block" }}>
            07 · {t("Langkah berikutnya", "Next step")}
          </Reveal>
          <Reveal as="h2" id="cta-title" className="cta-lead">
            {lang === "en" ? (
              <>
                Let&apos;s make Jakarta arrive <em>on time</em>.
              </>
            ) : (
              <>
                Mari buat Jakarta <em>tiba tepat waktu</em>.
              </>
            )}
          </Reveal>
          <Reveal className="cta-actions">
            <Link className="btn-primary" href="/login">
              <span>{t("Ajukan pilot koridor", "Request a corridor pilot")}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="btn-ghost" href="/login">
              {t("Jadwalkan demo", "Book a demo")}
            </Link>
          </Reveal>

          <div className="cta-meta">
            <Reveal className="col">
              <div className="ch">{t("Kontak", "Contact")}</div>
              <p>
                <a href="mailto:hello@tiba.id">hello@tiba.id</a>
                <br />
                Jakarta, Indonesia
              </p>
            </Reveal>
            <Reveal className="col">
              <div className="ch">{t("Aksesibilitas", "Accessibility")}</div>
              <p>
                {t(
                  "Dirancang sesuai WCAG 2.1 AA: navigasi keyboard penuh, fokus terlihat, dan pengalaman statis lengkap saat gerak dikurangi diminta.",
                  "Designed to WCAG 2.1 AA: full keyboard navigation, visible focus, and a complete static experience when reduced motion is requested.",
                )}
              </p>
            </Reveal>
            <Reveal className="col">
              <div className="ch">{t("Bahasa", "Language")}</div>
              <p>
                <button
                  type="button"
                  className="lang-inline"
                  onClick={() => setLang("id")}
                  style={{ textDecoration: lang === "id" ? "underline" : "none" }}
                >
                  Bahasa Indonesia
                </button>{" "}
                /{" "}
                <button
                  type="button"
                  className="lang-inline"
                  onClick={() => setLang("en")}
                  style={{ textDecoration: lang === "en" ? "underline" : "none" }}
                >
                  English
                </button>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-row">
          <span className="brand">
            Tib<span className="ai">AI</span>
          </span>
          <div className="footer-legal">
            <span>{t("Tiba · keandalan kedatangan untuk Jakarta", "Tiba · arrival reliability for Jakarta")}</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
