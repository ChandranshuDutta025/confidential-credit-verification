"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useWalletDetection,
  type UseWalletDetectionReturn,
} from "./useWalletDetection";

const WalletContext = createContext<UseWalletDetectionReturn | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWalletDetection();
  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}

export function useWalletContext(): UseWalletDetectionReturn {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be used within WalletProvider");
  return ctx;
}
