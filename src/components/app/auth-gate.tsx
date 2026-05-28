"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const AUTH_KEY = "tiba-demo-authed";

/**
 * Demo login gate. No real authentication and no protected data: it only checks
 * a client flag set by the /login screen and routes unauthenticated visitors
 * back to it. Children render identically on the server and client, so there is
 * no hydration mismatch; the redirect is a post-hydration side effect.
 */
export function AppAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (window.localStorage.getItem(AUTH_KEY) !== "1") router.replace("/login");
  }, [router]);

  return <>{children}</>;
}
