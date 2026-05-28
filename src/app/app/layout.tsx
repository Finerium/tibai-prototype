import { AppThemeProvider } from "@/components/app/theme-context";
import { AppAuthGate } from "@/components/app/auth-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <AppAuthGate>{children}</AppAuthGate>
    </AppThemeProvider>
  );
}
