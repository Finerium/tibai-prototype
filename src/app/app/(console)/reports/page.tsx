import type { Metadata } from "next";
import { ReportsScreen } from "@/components/app/screens/reports-screen";

export const metadata: Metadata = { title: "Laporan" };

export default function ReportsPage() {
  return <ReportsScreen />;
}
