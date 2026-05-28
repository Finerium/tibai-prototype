import type { Metadata } from "next";
import { RiderScreen } from "@/components/app/screens/rider-screen";

export const metadata: Metadata = { title: "Tampilan penumpang" };

export default function RiderPage() {
  return <RiderScreen />;
}
