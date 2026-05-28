"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon, StatusDot } from "./icons";

export interface RailItem {
  id: string;
  icon: string;
  label: string;
  href: string;
}

export const RAIL_ITEMS: RailItem[] = [
  { id: "operator", icon: "activity", label: "Operasi", href: "/app" },
  { id: "corridors", icon: "route", label: "Koridor", href: "/app/corridors/tj-6" },
  { id: "interchange", icon: "shuffle", label: "Simpul", href: "/app/interchanges/dukuh-atas" },
  { id: "reports", icon: "report", label: "Laporan", href: "/app/reports" },
  { id: "settings", icon: "settings", label: "Pengaturan", href: "/app/settings" },
];

export function Wordmark({ size = 16 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      Tib<span className="ai">AI</span>
    </span>
  );
}

export function TopBar({
  theme,
  onTheme,
  consoleMode,
  onConsole,
  onOpenCmdK,
  sysScore,
  sysStatus,
}: {
  theme: string;
  onTheme: () => void;
  consoleMode: "operator" | "rider";
  onConsole: (m: "operator" | "rider") => void;
  onOpenCmdK: () => void;
  sysScore: number;
  sysStatus: "ok" | "warn" | "alert";
}) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <Wordmark size={17} />
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span className="brand-sub">Reliability Console</span>
        </div>
      </div>

      <div className="topbar__context">
        <div className="ctx-item">
          <span className="k">Instansi</span>
          <span className="v">DISHUB DKI Jakarta</span>
        </div>
        <div className="divider-x" style={{ height: 26 }} />
        <div className="ctx-item">
          <span className="k">Status sistem</span>
          <StatusDot
            status={sysStatus}
            label={sysStatus === "ok" ? "Operasional" : sysStatus === "warn" ? "Perhatian" : "Insiden"}
          />
        </div>
        <div className="divider-x" style={{ height: 26 }} />
        <div className="ctx-item">
          <span className="k">Skor keandalan</span>
          <span className="v num">{sysScore}</span>
        </div>
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__tools">
        <button className="cmdk-trigger" onClick={onOpenCmdK} aria-label="Buka command palette">
          <Icon name="search" size={15} style={{ flex: "none" }} />
          <span className="ct-text">Cari koridor, simpul, perintah</span>
          <span className="kbd">⌘K</span>
        </button>

        <div className="seg" role="group" aria-label="Pilih konsol">
          <button aria-pressed={consoleMode === "operator"} onClick={() => onConsole("operator")}>
            <Icon name="activity" size={14} /> Operator
          </button>
          <button aria-pressed={consoleMode === "rider"} onClick={() => onConsole("rider")}>
            <Icon name="user" size={14} /> Penumpang
          </button>
        </div>

        <button className="icon-btn" aria-label="Notifikasi">
          <Icon name="bell" size={17} />
        </button>
        <button
          className="icon-btn"
          onClick={onTheme}
          aria-label="Ganti mode terang/gelap"
          aria-pressed={theme === "light"}
        >
          <Icon name={theme === "dark" ? "moon" : "sun"} size={17} />
        </button>
        <div className="rail-avatar" title="Analis DISHUB">
          AS
        </div>
      </div>
    </header>
  );
}

export function LeftRail({ currentKey, onHelp }: { currentKey: string; onHelp: () => void }) {
  return (
    <nav className="rail" aria-label="Navigasi utama">
      <div className="rail__nav">
        {RAIL_ITEMS.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            className="rail-item"
            aria-current={currentKey === it.id ? "page" : undefined}
          >
            <span className="rail-ico">
              <Icon name={it.icon} size={19} />
            </span>
            <span className="lbl">{it.label}</span>
          </Link>
        ))}
      </div>
      <div className="rail__foot">
        <button className="rail-item" onClick={onHelp}>
          <span className="rail-ico">
            <Icon name="info" size={19} />
          </span>
          <span className="lbl">Bantuan</span>
        </button>
      </div>
    </nav>
  );
}

/* ---- COMMAND PALETTE (cmd-K) ---- */
export interface Command {
  id: string;
  group?: string;
  icon?: string;
  title: string;
  sub?: string;
  keywords?: string;
  run?: () => void;
}

export function CommandPalette({
  open,
  onClose,
  commands,
  onRun,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  onRun: (c: Command) => void;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const r1 = requestAnimationFrame(() => {
        setMounted(true);
        setQ("");
        setSel(0);
        requestAnimationFrame(() => {
          setShow(true);
          inputRef.current?.focus();
        });
      });
      return () => cancelAnimationFrame(r1);
    }
    const r2 = requestAnimationFrame(() => setShow(false));
    const id = setTimeout(() => setMounted(false), 220);
    return () => {
      cancelAnimationFrame(r2);
      clearTimeout(id);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return commands;
    return commands.filter((c) =>
      (c.title + " " + (c.group || "") + " " + (c.keywords || "")).toLowerCase().includes(term),
    );
  }, [q, commands]);

  const groups = useMemo(() => {
    const m = new Map<string, Command[]>();
    filtered.forEach((c) => {
      const g = c.group || "Umum";
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(c);
    });
    return [...m.entries()];
  }, [filtered]);

  const flat = filtered;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(flat.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[sel]) {
        onRun(flat[sel]);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!mounted) return null;
  let idx = -1;
  return (
    <div
      className={"cmdk-scrim" + (show ? " show" : "")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKey}>
        <div className="cmdk__input">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            placeholder="Ketik perintah atau cari…"
            aria-label="Cari perintah"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="cmdk__list">
          {flat.length === 0 && (
            <div className="state-block" style={{ padding: "28px 16px" }}>
              <div className="ico">
                <Icon name="search" size={22} />
              </div>
              <p>Tidak ada hasil untuk “{q}”.</p>
            </div>
          )}
          {groups.map(([g, items]) => (
            <div key={g}>
              <div className="cmdk__group">{g}</div>
              {items.map((c) => {
                idx++;
                const isSel = idx === sel;
                return (
                  <button
                    key={c.id}
                    className="cmdk__item"
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setSel(flat.indexOf(c))}
                    onClick={() => {
                      onRun(c);
                      onClose();
                    }}
                  >
                    <Icon name={c.icon || "dot"} size={16} />
                    <span className="ci-title">{c.title}</span>
                    {c.sub && <span className="ci-sub">{c.sub}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk__foot">
          <span className="fk">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> navigasi
          </span>
          <span className="fk">
            <span className="kbd">↵</span> pilih
          </span>
          <span className="fk">
            <span className="kbd">esc</span> tutup
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- INSPECTOR (slides from right edge) ---- */
export function Inspector({
  open,
  onClose,
  eyebrow,
  title,
  status,
  statusLabel,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  status?: string | null;
  statusLabel?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className={"inspector" + (open ? " open" : "")} aria-hidden={!open} aria-label="Panel inspeksi">
      <div className="inspector__head">
        <div className="titles">
          {eyebrow && (
            <div className="eyebrow" style={{ marginBottom: 5 }}>
              {eyebrow}
            </div>
          )}
          <h3>{title}</h3>
          {status && (
            <div style={{ marginTop: 7 }}>
              <StatusDot status={status} label={statusLabel || ""} />
            </div>
          )}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Tutup panel">
          <Icon name="x" size={17} />
        </button>
      </div>
      <div className="inspector__body">{children}</div>
      {footer && <div className="inspector__foot">{footer}</div>}
    </aside>
  );
}
