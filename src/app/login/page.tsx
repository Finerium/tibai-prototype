import type { Metadata } from "next";
import { LoginScreen } from "@/components/app/screens/login-screen";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return <LoginScreen />;
}
