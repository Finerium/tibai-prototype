"use client";

import { useRouter } from "next/navigation";

/**
 * Maps the dashboard bundle's logical destinations onto real Next.js routes.
 */
export function useAppNav() {
  const router = useRouter();
  return (dest: string, payload?: string) => {
    switch (dest) {
      case "operator":
        router.push("/app");
        break;
      case "corridors":
        router.push("/app/corridors/" + (payload || "tj-6"));
        break;
      case "interchange":
        router.push("/app/interchanges/dukuh-atas");
        break;
      case "reports":
        router.push("/app/reports");
        break;
      case "settings":
        router.push("/app/settings");
        break;
      case "rider":
        router.push("/app/rider");
        break;
      default:
        router.push("/app");
    }
  };
}
