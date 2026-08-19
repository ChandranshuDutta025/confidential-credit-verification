"use client";

import { WalletProvider, useWalletContext } from "@/lib/hooks/WalletProvider";
import { Navbar } from "@/components/Navbar";

function NavbarWrapper() {
  const wallet = useWalletContext();

  return (
    <Navbar
      walletStatus={wallet.status}
      walletInfo={wallet.walletInfo}
      onConnect={wallet.connect}
      onDisconnect={wallet.disconnect}
      onRetry={wallet.retry}
      onDemoMode={wallet.connectDemo}
    />
  );
}

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <div className="min-h-screen w-full text-slate-900 font-sans overflow-x-hidden flex flex-col">
        <NavbarWrapper />

        <main className="flex-1">{children}</main>

      <footer className="w-full py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  MidScore
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Confidential Credit Verification &mdash; Built with
                Zero-Knowledge Proofs on the Midnight Network.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}
