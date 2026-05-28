import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tiba · Keandalan kedatangan transit untuk Jakarta",
    template: "%s · Tiba",
  },
  description:
    "Tiba memprediksi keandalan kedatangan transit Jakarta sebagai rentang probabilitas P10-P50-P90. Platform pendukung keputusan untuk DISHUB DKI Jakarta.",
  applicationName: "Tiba",
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
