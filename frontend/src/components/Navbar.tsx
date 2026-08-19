"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const { toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const networkLabel = process.env.NEXT_PUBLIC_NETWORK || "undeployed";

  const shortAddr = walletInfo
    ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`
    : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <div className="glass flex items-center justify-between rounded-full px-5 py-2.5 w-full max-w-5xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white hidden sm:inline">MidScore</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-400 transition-colors hover:text-white hover:bg-white/5"
            aria-label="Toggle theme"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </button>

          {/* Network badge */}
          <span className="hidden sm:inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
            {networkLabel}
          </span>

          {/* Wallet states */}
          {walletStatus === "detecting" && (
            <span className="flex items-center gap-1.5 text-[13px] text-slate-400">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-slate-600 border-t-blue-400" />
              <span className="hidden sm:inline">Detecting</span>
            </span>
          )}

          {walletStatus === "not_found" && (
            <div className="flex items-center gap-1.5">
              <button onClick={onRetry} className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20">
                Not Found
              </button>
              <button onClick={onDemoMode} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                Demo
              </button>
            </div>
          )}

          {walletStatus === "error" && (
            <div className="flex items-center gap-1.5">
              <button onClick={onRetry} className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20">
                Retry
              </button>
              <button onClick={onDemoMode} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                Demo
              </button>
            </div>
          )}

          {(walletStatus === "found" || walletStatus === "not_found" || walletStatus === "error") && (
            <button
              onClick={onConnect}
              className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10 active:scale-[0.97]"
            >
              Connect
            </button>
          )}

          {walletStatus === "connecting" && (
            <span className="flex items-center gap-1.5 text-[13px] text-slate-400">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-slate-600 border-t-blue-400" />
              <span className="hidden sm:inline">Connecting</span>
            </span>
          )}

          {walletStatus === "connected" && walletInfo && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {shortAddr}
              </span>
              <button
                onClick={onDisconnect}
                className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex rounded-full p-2 text-slate-400 transition-colors hover:text-white hover:bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="glass absolute left-4 right-4 top-16 rounded-2xl p-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
