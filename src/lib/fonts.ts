import { Geist, Geist_Mono, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Reconciled font system for the two Tiba surfaces.
 *
 * Landing surface (faithful to the landing bundle): Geist + Geist Mono for body
 * and mono, Clash Display (a modern display grotesque, self-hosted) for the hero
 * and section openers.
 *
 * Application surface (faithful to the dashboard bundle): IBM Plex Sans + IBM
 * Plex Mono.
 *
 * Both surfaces share the terracotta accent and warm neutrals defined in CSS.
 * All faces are self-hosted through next/font so there are no render-blocking
 * external requests.
 */

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const clashDisplay = localFont({
  src: [
    { path: "../fonts/ClashDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-clash",
});

export const fontVariables = [
  geist.variable,
  geistMono.variable,
  ibmPlexSans.variable,
  ibmPlexMono.variable,
  clashDisplay.variable,
].join(" ");
