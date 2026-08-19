"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import type { WalletStatus } from "@/lib/hooks/useWalletDetection";
import type { WalletInfo } from "@/lib/types";
import { useTheme } from "@/lib/hooks/useTheme";

interface NavbarProps {
  walletStatus: WalletStatus;
  walletInfo: WalletInfo | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onRetry: () => void;
  onDemoMode: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/eligibility", label: "Eligibility" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar({
  walletStatus,
  walletInfo,
  onConnect,
  onDisconnect,
  onRetry,
  onDemoMode,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const networkLabel = process.env.NEXT_PUBLIC_NETWORK || "undeployed";
  const isPreprod = networkLabel === "preprod";

  const shortAddr = walletInfo
    ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`
    : "";

  return (
    <nav
      className="sticky top-4 z-50 mx-auto max-w-7xl px-4"
    >
      <div className="glass-panel flex items-center justify-between rounded-full px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg
              className="h-4 w-4 text-white"
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
          <span className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            MidScore
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <span
            className={`hidden rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline ${
              isPreprod
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {networkLabel}
          </span>

          {walletStatus === "detecting" && (
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <span className="hidden sm:inline">Detecting...</span>
            </span>
          )}

          {walletStatus === "not_found" && (
            <div className="flex items-center gap-2">
              <button
                onClick={onRetry}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                Lace Not Found
              </button>
              <button
                onClick={onDemoMode}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                Demo Mode
              </button>
            </div>
          )}

          {walletStatus === "error" && (
            <div className="flex items-center gap-2">
              <button
                onClick={onRetry}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                Retry
              </button>
              <button
                onClick={onDemoMode}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                Demo Mode
              </button>
            </div>
          )}

          {(walletStatus === "found" || walletStatus === "not_found") && (
            <button
              onClick={onConnect}
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Connect Wallet
            </button>
          )}

          {walletStatus === "connecting" && (
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <span className="hidden sm:inline">Connecting...</span>
            </span>
          )}

          {walletStatus === "connected" && walletInfo && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                {shortAddr}
              </span>
              <button
                onClick={onDisconnect}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
              >
                Disconnect
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="glass-panel mt-2 rounded-2xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
