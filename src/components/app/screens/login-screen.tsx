"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../icons";
import { Wordmark } from "../chrome";
import { AUTH_KEY } from "../auth-gate";

function LoginAside() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <svg viewBox="0 0 600 800" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="600" height="800" fill="var(--map-land)" />
          <path
            d="M 300 -20 C 360 160, 300 320, 380 460 S 460 700, 420 880"
            fill="none"
            stroke="var(--map-water)"
            strokeWidth="26"
            opacity="0.7"
            strokeLinecap="round"
          />
          <polyline
            points="300,60 312,220 330,360 300,470 270,620 250,760"
            fill="none"
            stroke="var(--seq-5)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <polyline
            points="120,120 200,260 300,360 380,500 440,680"
            fill="none"
            stroke="var(--seq-3)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <polyline
            points="500,120 470,300 420,460 460,640"
            fill="none"
            stroke="var(--div-neg-1)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <rect
            x="293"
            y="353"
            width="14"
            height="14"
            rx="2"
            fill="var(--bg-0)"
            stroke="var(--text-0)"
            strokeWidth="2.4"
            transform="rotate(45 300 360)"
          />
        </svg>
      </div>
      <div style={{ marginTop: "auto", padding: 28, position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="login-banner">
          <Icon name="info" size={15} /> Demo: gunakan sandi apa pun (≥6 karakter). Sandi “gagal” memicu galat.
        </div>
        <blockquote
          style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: "var(--text-0)", fontWeight: 500, letterSpacing: "-0.01em" }}
        >
          “Keandalan bukan satu angka kedatangan. Ia adalah seberapa lebar ketidakpastian yang kita minta warga
          tanggung.”
        </blockquote>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
          Tiba · prakiraan kedatangan probabilistik (P10 · P50 · P90)
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; pw?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailErr = touched.email && !/^[^@]+@[^@]+\.[^@]+$/.test(email) ? "Masukkan alamat surel yang sah." : "";
  const pwErr = touched.pw && pw.length < 6 ? "Kata sandi minimal 6 karakter." : "";
  const canSubmit = !!email && pw.length >= 6 && !loading;

  const enter = () => {
    if (typeof window !== "undefined") window.localStorage.setItem(AUTH_KEY, "1");
    router.push("/app");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, pw: true });
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email) || pw.length < 6) return;
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (pw.toLowerCase() === "gagal") {
        setLoading(false);
        setError("Kredensial tidak dikenali. Hubungi admin DISHUB bila berulang.");
        return;
      }
      enter();
    }, 950);
  };

  return (
    <div className="tiba-app" data-theme="dark" data-density="comfy" data-motion="on">
      <div className="login">
        <div className="login__main">
          <div className="login__brand">
            <Wordmark size={20} />
            <span className="brand-sub" style={{ borderLeft: "1px solid var(--line)", paddingLeft: 12 }}>
              Reliability Console
            </span>
          </div>

          <div className="login__center">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Konsol Operator · DISHUB DKI Jakarta
            </div>
            <h1>Masuk ke Tiba</h1>
            <p className="lead">
              Platform keandalan kedatangan untuk TransJakarta, MRT, LRT, dan KRL. Akses terbatas untuk analis dan
              operator terdaftar.
            </p>

            {error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  padding: "11px 13px",
                  marginBottom: 18,
                  borderRadius: "var(--r-md)",
                  background: "oklch(from var(--alert) l c h / 0.12)",
                  border: "1px solid oklch(from var(--alert) l c h / 0.3)",
                  color: "var(--alert)",
                  fontSize: 12.5,
                }}
              >
                <Icon name="alert" size={16} style={{ flex: "none", marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="li-email">Surel dinas</label>
                <input
                  id="li-email"
                  className="input"
                  type="email"
                  autoComplete="username"
                  placeholder="nama@dishub.jakarta.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!emailErr}
                  aria-describedby={emailErr ? "li-email-err" : undefined}
                />
                {emailErr && (
                  <span className="field-error" id="li-email-err">
                    <Icon name="alert" size={13} />
                    {emailErr}
                  </span>
                )}
              </div>

              <div className="field">
                <div className="row between">
                  <label htmlFor="li-pw" style={{ whiteSpace: "nowrap" }}>
                    Kata sandi
                  </label>
                  <button
                    type="button"
                    className="btn--ghost"
                    style={{ background: "none", border: 0, color: "var(--accent)", fontSize: 12, cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}
                  >
                    Lupa sandi?
                  </button>
                </div>
                <input
                  id="li-pw"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
                  aria-invalid={!!pwErr}
                  aria-describedby={pwErr ? "li-pw-err" : undefined}
                />
                {pwErr && (
                  <span className="field-error" id="li-pw-err">
                    <Icon name="alert" size={13} />
                    {pwErr}
                  </span>
                )}
              </div>

              <button type="submit" className="btn btn--primary" disabled={!canSubmit} style={{ height: 42, marginTop: 4 }}>
                {loading ? (
                  <>
                    <span className="skel" style={{ width: 14, height: 14, borderRadius: "50%" }} /> Memeriksa…
                  </>
                ) : (
                  <>
                    Masuk <Icon name="arrowRight" size={16} />
                  </>
                )}
              </button>

              <div className="sso-line">atau</div>

              <button type="button" className="btn" style={{ height: 42 }} onClick={enter}>
                <Icon name="lock" size={15} /> Masuk dengan SSO Pemprov DKI
              </button>
            </form>
          </div>

          <div className="login__foot">
            <div className="gov">
              <span className="gov-seal">DKI</span>
              <span>Pemerintah Provinsi Daerah Khusus Jakarta · Dinas Perhubungan</span>
            </div>
            <span style={{ marginLeft: "auto" }} className="mono">
              v2.4 · lingkungan: produksi
            </span>
          </div>
        </div>

        <aside className="login__aside">
          <LoginAside />
        </aside>
      </div>
    </div>
  );
}
