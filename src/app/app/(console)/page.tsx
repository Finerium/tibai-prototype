import type { Metadata } from "next";
import { OperatorScreen } from "@/components/app/screens/operator-screen";

export const metadata: Metadata = { title: "Operasi" };

export default function OperatorPage() {
  return <OperatorScreen />;
}
