"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
export type Density = "compact" | "regular" | "comfy";
export type Motion = "on" | "off";

interface ThemeCtx {
  theme: Theme;
  density: Density;
  motion: Motion;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
  setMotion: (m: Motion) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

/**
 * Locked application defaults from the dashboard bundle: dark theme, comfy
 * density, motion on. State persists across in-app navigation because the
 * provider lives in the /app layout, which is not remounted between routes.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [density, setDensity] = useState<Density>("comfy");
  const [motion, setMotion] = useState<Motion>("on");
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <Ctx.Provider value={{ theme, density, motion, setTheme, setDensity, setMotion, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAppTheme must be used within AppThemeProvider");
  return c;
}
