import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import ClientShell from "@/components/ClientShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "MidScore — Confidential Credit Verification",
  description:
    "Privacy-preserving credit eligibility verification using zero-knowledge proofs on the Midnight Network.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ClientShell>{children}</ClientShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
