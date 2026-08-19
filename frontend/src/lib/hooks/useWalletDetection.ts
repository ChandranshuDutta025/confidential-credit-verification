"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WalletInfo } from "../types";

const POLL_MS = 400;
const MAX_POLL = 25;
const SYNC_TIMEOUT_MS = 5000;
const DEMO_TIMEOUT_MS = 3000;

const DUMMY_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms),
    ),
  ]);
}

type MnLaceOld = {
  isEnabled: () => Promise<boolean>;
  enable: () => Promise<{ state: () => Promise<{ address: string }> }>;
  state: () => Promise<{ address: string }>;
  serviceUriConfig: () => Promise<{
    networkId?: string;
    substrateNodeUri?: string;
  }>;
};

type MnLaceNew = {
  connect: (networkId?: string) => Promise<{
    getUnshieldedAddress: () => Promise<{ unshieldedAddress: string }>;
    getConfiguration: () => Promise<{ networkId: string }>;
    getConnectionStatus: () => Promise<{
      status: string;
      networkId?: string;
    }>;
  }>;
  name?: string;
};

function getMidnightObj(): Record<string, unknown> | null {
  const m = (window as unknown as Record<string, unknown>)["midnight"] as
    | Record<string, unknown>
    | undefined;
  return m && typeof m === "object" ? m : null;
}

function getMnLace(): MnLaceOld | MnLaceNew | null {
  const m = getMidnightObj();
  if (!m) return null;
  if (m.mnLace) return m.mnLace as MnLaceOld | MnLaceNew;
  const keys = Object.keys(m);
  if (keys.length > 0) return m[keys[0]] as MnLaceNew;
  return null;
}

function getWalletName(): string {
  const m = getMidnightObj();
  if (!m) return "Wallet";
  if (m.mnLace) {
    const wl = m.mnLace as Record<string, unknown>;
    if (typeof wl.name === "string") return wl.name;
  }
  const keys = Object.keys(m);
  if (keys.length > 0) {
    const wl = m[keys[0]] as Record<string, unknown>;
    if (typeof wl.name === "string") return wl.name;
  }
  return "Lace Wallet";
}

export type WalletStatus =
  | "detecting"
  | "not_found"
  | "found"
  | "connecting"
  | "connected"
  | "error";

export interface UseWalletDetectionReturn {
  status: WalletStatus;
  walletInfo: WalletInfo | null;
  error: string | null;
  connect: () => Promise<void>;
  connectDemo: () => void;
  disconnect: () => void;
  retry: () => void;
  copyToClipboard: (text: string) => void;
}

export function useWalletDetection(): UseWalletDetectionReturn {
  const [status, setStatus] = useState<WalletStatus>("detecting");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const detect = useCallback(() => {
    if (!mountedRef.current) return false;
    const lace = getMnLace();
    if (lace) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus("found");
      return true;
    }
    retriesRef.current += 1;
    if (retriesRef.current >= MAX_POLL) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus("not_found");
    }
    return false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    retriesRef.current = 0;
    if (detect()) return;
    intervalRef.current = setInterval(detect, POLL_MS);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [detect]);

  const connectDemo = useCallback(() => {
    console.warn("[Demo Mode]: Using mock wallet address");
    if (!mountedRef.current) return;
    setWalletInfo({
      address: DUMMY_ADDRESS,
      networkId: process.env.NEXT_PUBLIC_NETWORK || "preprod",
      walletName: "Demo Wallet",
    });
    setError(null);
    setStatus("connected");
  }, []);

  const connect = useCallback(async () => {
    const lace = getMnLace();
    if (!lace) {
      setError(
        "Lace Wallet extension not detected. Please install it, enable Demo Mode, or reload.",
      );
      setStatus("error");
      return;
    }
    setStatus("connecting");
    setError(null);

    try {
      if ("connect" in lace && typeof lace.connect === "function") {
        const newApi = lace as MnLaceNew;
        const desiredNetwork =
          process.env.NEXT_PUBLIC_NETWORK || "preprod";
        const fallbackNetworks = ["undeployed", "mainnet"].filter(
          (n) => n !== desiredNetwork,
        );
        const networksToTry = [desiredNetwork, ...fallbackNetworks];

        let connected;
        for (const net of networksToTry) {
          try {
            connected = await withTimeout(newApi.connect(net), DEMO_TIMEOUT_MS);
            break;
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            console.warn(`[wallet] connect("${net}") failed:`, msg);
            continue;
          }
        }
        if (!connected) {
          console.warn(
            "[Demo Mode]: All wallet connections failed, falling back to demo wallet",
          );
          connectDemo();
          return;
        }

        let address = "";
        let networkId = desiredNetwork;
        try {
          const addr = await withTimeout(
            connected.getUnshieldedAddress(),
            SYNC_TIMEOUT_MS,
          );
          address = addr.unshieldedAddress;
        } catch (e: unknown) {
          console.warn(
            "[Wallet Sync Warning]: Proceeding with partial sync —",
            e instanceof Error ? e.message : e,
          );
        }
        try {
          const config = await withTimeout(
            connected.getConfiguration(),
            SYNC_TIMEOUT_MS,
          );
          networkId = config.networkId;
        } catch (e: unknown) {
          console.warn(
            "[Wallet Sync Warning]: Could not fetch config, using desired network —",
            e instanceof Error ? e.message : e,
          );
        }

        if (!mountedRef.current) return;
        setWalletInfo({
          address,
          networkId,
          walletName: getWalletName(),
        });
        setStatus("connected");
        return;
      }

      if (
        "enable" in lace &&
        typeof (lace as MnLaceOld).enable === "function"
      ) {
        const oldApi = lace as MnLaceOld;
        const alreadyEnabled = await withTimeout(
          oldApi.isEnabled(),
          DEMO_TIMEOUT_MS,
        ).catch(() => false);
        if (!alreadyEnabled) {
          await withTimeout(oldApi.enable(), DEMO_TIMEOUT_MS);
        }

        let address = "";
        let networkId =
          process.env.NEXT_PUBLIC_NETWORK || "unknown";
        try {
          const st = await withTimeout(oldApi.state(), SYNC_TIMEOUT_MS);
          address = st.address;
        } catch (e: unknown) {
          console.warn(
            "[Wallet Sync Warning]: Proceeding with partial sync —",
            e instanceof Error ? e.message : e,
          );
        }
        try {
          const config = await withTimeout(
            oldApi.serviceUriConfig(),
            SYNC_TIMEOUT_MS,
          );
          networkId = config.networkId || networkId;
        } catch (e: unknown) {
          console.warn(
            "[Wallet Sync Warning]: Could not fetch service config —",
            e instanceof Error ? e.message : e,
          );
        }

        if (!mountedRef.current) return;
        setWalletInfo({
          address,
          networkId,
          walletName: getWalletName(),
        });
        setStatus("connected");
        return;
      }

      console.warn(
        "[Demo Mode]: Wallet API not recognized, falling back to demo wallet",
      );
      connectDemo();
      return;
    } catch {
      if (!mountedRef.current) return;
      console.warn(
        "[Demo Mode]: Connection failed, falling back to demo wallet",
      );
      connectDemo();
    }
  }, [connectDemo]);

  const disconnect = useCallback(() => {
    setWalletInfo(null);
    setError(null);
    retriesRef.current = 0;
    setStatus(getMnLace() ? "found" : "not_found");
  }, []);

  const retry = useCallback(() => {
    retriesRef.current = 0;
    setError(null);
    setStatus("detecting");
    if (detect()) return;
    intervalRef.current = setInterval(detect, POLL_MS);
  }, [detect]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // noop
    }
  }, []);

  return {
    status,
    walletInfo,
    error,
    connect,
    connectDemo,
    disconnect,
    retry,
    copyToClipboard,
  };
}
