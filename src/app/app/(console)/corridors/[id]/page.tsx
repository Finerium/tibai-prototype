import type { Metadata } from "next";
import { CorridorScreen } from "@/components/app/screens/corridor-screen";
import { findCorridor } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = findCorridor(id);
  return { title: c ? c.name : "Koridor" };
}

export default async function CorridorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CorridorScreen corridorId={id} />;
}
