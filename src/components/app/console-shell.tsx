"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopBar, LeftRail, CommandPalette, RAIL_ITEMS, type Command } from "./chrome";
import { useAppTheme } from "./theme-context";
import { useAppNav } from "./use-nav";
import { corridors, kpis, modeIcon } from "@/lib/data";

function currentKeyFor(pathname: string): string {
  if (pathname === "/app") return "operator";
  if (pathname.startsWith("/app/corridors")) return "corridors";
  if (pathname.startsWith("/app/interchanges")) return "interchange";
  if (pathname.startsWith("/app/reports")) return "reports";
  if (pathname.startsWith("/app/settings")) return "settings";
  return "operator";
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const { theme, density, motion, toggleTheme } = useAppTheme();
  const router = useRouter();
  const navigate = useAppNav();
  const pathname = usePathname();
  const [cmdk, setCmdk] = useState(false);

  // global cmd-K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdk((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = RAIL_ITEMS.map((it) => ({
      id: "nav-" + it.id,
      group: "Navigasi",
      icon: it.icon,
      title: it.label,
      sub: "Buka",
      run: () => router.push(it.href),
    }));
    const cors: Command[] = corridors.map((c) => ({
      id: "cor-" + c.id,
      group: "Koridor",
      icon: modeIcon[c.mode],
      title: c.name,
      sub: c.code,
      keywords: c.code + " " + c.mode,
      run: () => navigate("corridors", c.id),
    }));
    const actions: Command[] = [
      { id: "act-rider", group: "Tindakan", icon: "user", title: "Beralih ke tampilan penumpang", run: () => navigate("rider") },
      {
        id: "act-theme",
        group: "Tindakan",
        icon: theme === "dark" ? "sun" : "moon",
        title: "Ganti mode " + (theme === "dark" ? "terang" : "gelap"),
        run: toggleTheme,
      },
      { id: "act-ix", group: "Tindakan", icon: "shuffle", title: "Buka simpul Dukuh Atas", run: () => navigate("interchange") },
      { id: "act-report", group: "Tindakan", icon: "report", title: "Buat laporan keandalan", run: () => navigate("reports") },
    ];
    return [...actions, ...nav, ...cors];
  }, [theme, router, navigate, toggleTheme]);

  const sysScore = kpis[0].value;

  return (
    <div className="tiba-app console" data-theme={theme} data-density={density} data-motion={motion}>
      <div className="app">
        <TopBar
          theme={theme}
          onTheme={toggleTheme}
          consoleMode="operator"
          onConsole={(m) => (m === "rider" ? navigate("rider") : navigate("operator"))}
          onOpenCmdK={() => setCmdk(true)}
          sysScore={sysScore}
          sysStatus="warn"
        />
        <LeftRail currentKey={currentKeyFor(pathname)} onHelp={() => setCmdk(true)} />
        <main className="main">{children}</main>
      </div>
      <CommandPalette open={cmdk} onClose={() => setCmdk(false)} commands={commands} onRun={(c) => c.run && c.run()} />
    </div>
  );
}
