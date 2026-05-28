import type { Metadata } from "next";
import { InterchangeScreen } from "@/components/app/screens/interchange-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: id === "dukuh-atas" ? "Dukuh Atas" : "Simpul" };
}

export default async function InterchangePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InterchangeScreen id={id} />;
}
