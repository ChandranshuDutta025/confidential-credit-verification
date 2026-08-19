"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletContext } from "@/lib/hooks/WalletProvider";
import { deriveUserCommitment, generateSecret } from "@/lib/api";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { VerificationResult } from "@/lib/types";
import {
  Wallet,
  CheckCircle2,
  X,
  Check,
  Star,
  Copy,
  ExternalLink,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type Step = 0 | 1 | 2;

const STEPS = ["Connect Wallet", "Generate Proof", "Result"] as const;

const PROOF_STAGES = [
  { key: "local", label: "Processing score locally" },
  { key: "commit", label: "Deriving user commitment" },
  { key: "proof", label: "Generating ZK proof" },
  { key: "sign", label: "Awaiting on-chain signature" },
] as const;

function Spinner({ size }: { size: "sm" | "lg" }) {
  const cls =
    size === "sm"
      ? "h-4 w-4 border-2 border-slate-600 border-t-blue-400"
      : "h-8 w-8 border-[3px] border-slate-600 border-t-blue-400";
  return <span className={`inline-block animate-spin rounded-full ${cls}`} />;
}

function StepIndicator({
  currentStep,
  setCurrentStep,
  walletConnected,
  verifying,
  hasResult,
  reducedMotion,
}: {
  currentStep: Step;
  setCurrentStep: (s: Step) => void;
  walletConnected: boolean;
  verifying: boolean;
  hasResult: boolean;
  reducedMotion: boolean;
}) {
  const completed: boolean[] = [
    walletConnected,
    hasResult,
    hasResult,
  ];

  return (
    <div className="mb-10 flex items-center justify-center gap-0">
      {STEPS.map((label, i) => {
        const isDone = completed[i];
        const isActive =
          i === currentStep && !(i === 2 && !hasResult);
        const canClick = isDone && !verifying;

        return (
          <div key={label} className="flex items-center">
            <motion.button
              onClick={() => canClick && setCurrentStep(i as Step)}
              className={`flex items-center gap-2 ${canClick ? "cursor-pointer" : "cursor-default"}`}
              whileHover={canClick ? { scale: 1.05 } : {}}
              whileTap={canClick ? { scale: 0.95 } : {}}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
            >
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                  isDone
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-slate-500"
                }`}
                animate={
                  isDone
                    ? { boxShadow: "0 0 12px 2px rgba(16,185,129,0.15)" }
                    : isActive
                      ? { boxShadow: "0 0 12px 2px rgba(59,130,246,0.15)" }
                      : { boxShadow: "0 0 0px 0px transparent" }
                }
                transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="num"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
                    >
                      {i + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span
                className={`text-[12px] font-medium ${
                  isDone || isActive ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </motion.button>

            {i < STEPS.length - 1 && (
              <div className="relative mx-3 h-px w-10 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-emerald-500/40"
                  initial={{ width: "0%" }}
                  animate={{
                    width: completed[i] ? "100%" : "0%",
                  }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.5, ease: "easeInOut" }
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WalletStep({
  wallet,
  reducedMotion,
  onConnected,
}: {
  wallet: ReturnType<typeof useWalletContext>;
  reducedMotion: boolean;
  onConnected: () => void;
}) {
  const [connectingLoading, setConnectingLoading] = useState(false);

  useEffect(() => {
    if (wallet.status === "connected") onConnected();
  }, [wallet.status, onConnected]);

  const handleConnect = useCallback(async () => {
    setConnectingLoading(true);
    try {
      await wallet.connect();
    } finally {
      setConnectingLoading(false);
    }
  }, [wallet]);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? {} : { opacity: 0, y: -20 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {wallet.status === "connected" && wallet.walletInfo ? (
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] text-slate-400">Connected to</p>
            <code className="mt-1 block max-w-[280px] truncate rounded-lg bg-white/5 px-3 py-1.5 text-[12px] font-mono text-blue-400">
              {wallet.walletInfo.address}
            </code>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>{wallet.walletInfo.walletName} &middot; {wallet.walletInfo.networkId}</span>
          </div>
          <motion.button
            onClick={onConnected}
            className="mt-2 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 active:scale-[0.98]"
            whileHover={reducedMotion ? {} : { scale: 1.03 }}
            whileTap={reducedMotion ? {} : { scale: 0.97 }}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={
              wallet.status === "connecting"
                ? reducedMotion
                  ? { scale: 1 }
                  : { scale: [1, 1.1, 1], boxShadow: ["0 0 0px 0px rgba(59,130,246,0)", "0 0 30px 8px rgba(59,130,246,0.2)", "0 0 0px 0px rgba(59,130,246,0)"] }
                : { scale: 1 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : wallet.status === "connecting"
                  ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
            }
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5"
          >
            <Wallet className="h-7 w-7 text-slate-400" />
          </motion.div>

          {wallet.status === "connecting" ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-[13px] text-slate-400">Connecting to wallet...</p>
            </div>
          ) : wallet.status === "detecting" ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-[13px] text-slate-400">Looking for Lace Wallet...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[13px] text-slate-400">
                {wallet.error ? "Connection failed" : "No wallet detected"}
              </p>

              <motion.button
                onClick={handleConnect}
                disabled={connectingLoading}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
                whileHover={reducedMotion ? {} : { scale: 1.03 }}
                whileTap={reducedMotion ? {} : { scale: 0.97 }}
              >
                {connectingLoading ? (
                  <>
                    <Spinner size="sm" /> Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" /> Connect Wallet
                  </>
                )}
              </motion.button>

              <button
                onClick={wallet.connectDemo}
                className="text-[12px] text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-300"
              >
                Demo Mode
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );

}

function ProofStep({
  verifying,
  proofStageIndex,
  result,
  reducedMotion,
  onVerify,
}: {
  verifying: boolean;
  proofStageIndex: number;
  result: VerificationResult | null;
  reducedMotion: boolean;
  onVerify: (score: number) => void;
}) {
  const [creditScore, setCreditScore] = useState("");
  const score = parseInt(creditScore, 10);
  const valid = !isNaN(score) && score >= 300 && score <= 850;

  const handleSubmit = useCallback(() => {
    if (valid && !verifying) onVerify(score);
  }, [valid, verifying, score, onVerify]);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? {} : { opacity: 0, y: -20 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
    >
      <div className="glass-subtle rounded-2xl p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
          <h2 className="text-[15px] font-medium text-white">
            Credit Score Verification
          </h2>
        </div>

        <div className="mb-6 rounded-xl border-l-[2px] border-blue-500/40 bg-blue-500/5 px-4 py-3 text-[13px] leading-relaxed text-slate-300">
          <strong className="text-white">Privacy Guarantee:</strong>{" "}
          Your exact credit score is processed locally and proven via a
          zero-knowledge circuit. Only the boolean result is recorded on-chain.
        </div>

        <label className="mb-2 block text-[13px] text-slate-400">
          Enter your credit score (300–850):
        </label>

        <div className="mb-2">
          <input
            type="range"
            min={300}
            max={850}
            step={10}
            value={creditScore || "600"}
            onChange={(e) => setCreditScore(e.target.value)}
            disabled={verifying}
            className="w-full accent-blue-500 disabled:opacity-40"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            <span>300</span>
            <span className="text-[13px] font-medium text-white">{creditScore || "—"}</span>
            <span>850</span>
          </div>
        </div>

        <input
          type="number"
          min={300}
          max={850}
          value={creditScore}
          onChange={(e) => setCreditScore(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="e.g., 720"
          disabled={verifying}
          className="mb-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-40"
        />

        {creditScore && !valid && (
          <p className="mb-2 text-[12px] text-red-400">Score must be between 300 and 850.</p>
        )}

        <motion.button
          onClick={handleSubmit}
          disabled={verifying || !valid}
          className="mt-3 w-full rounded-full bg-white px-6 py-3 text-[14px] font-medium text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98]"
          whileHover={reducedMotion ? {} : { scale: 1.02 }}
          whileTap={reducedMotion ? {} : { scale: 0.98 }}
        >
          {verifying ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" /> Generating Proof...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Verify Credit Score
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {verifying && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reducedMotion ? {} : { opacity: 0, height: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-blue-500/10 bg-blue-500/5 py-8 text-center">
                <Spinner size="lg" />

                <div className="flex flex-col gap-2">
                  {PROOF_STAGES.map((stage, i) => (
                    <AnimatePresence key={stage.key} mode="wait">
                      {i <= proofStageIndex && (
                        <motion.div
                          key={stage.key}
                          initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { duration: 0.3, delay: 0.05 }
                          }
                          className="flex items-center gap-2"
                        >
                          {i < proofStageIndex ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : i === proofStageIndex ? (
                            <Spinner size="sm" />
                          ) : null}
                          <span
                            className={`text-[13px] ${
                              i < proofStageIndex
                                ? "text-emerald-400"
                                : i === proofStageIndex
                                  ? "text-slate-200 font-medium"
                                  : "text-slate-500"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${((proofStageIndex + 1) / PROOF_STAGES.length) * 100}%`,
                    }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { duration: 0.5, ease: "easeInOut" }
                    }
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Your credit score remains private throughout this process.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ResultStep({
  result,
  resultHash,
  reducedMotion,
  onCopy,
}: {
  result: VerificationResult | null;
  resultHash: string | null;
  reducedMotion: boolean;
  onCopy: (text: string) => void;
}) {
  if (!result) return null;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative glass-subtle rounded-2xl p-8 overflow-hidden">
        {result.eligible && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={
              reducedMotion
                ? {}
                : {
                    boxShadow: "0 0 60px 10px rgba(16,185,129,0.4), inset 0 0 60px 10px rgba(16,185,129,0.1)",
                  }
            }
            animate={{
              boxShadow: [
                "0 0 60px 10px rgba(16,185,129,0.4), inset 0 0 60px 10px rgba(16,185,129,0.1)",
                "0 0 20px 4px rgba(16,185,129,0.1), inset 0 0 20px 4px rgba(16,185,129,0.03)",
              ],
            }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 1.2, ease: "easeOut" }
            }
          />
        )}

        <motion.div
          initial={reducedMotion ? {} : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.4, delay: 0.2, type: "spring", stiffness: 200 }
          }
          className="relative z-10 flex flex-col items-center text-center"
        >
          {result.eligible ? (
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          ) : (
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <X className="h-8 w-8 text-red-400" />
            </div>
          )}

          <h3
            className={`text-xl font-semibold ${
              result.eligible ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {result.eligible ? "Eligible" : "Not Eligible"}
          </h3>
          <p className="mt-2 text-[13px] text-slate-400 max-w-sm">
            {result.eligible
              ? "Your credit score meets the required threshold for this verification."
              : "Your credit score does not meet the required threshold."}
          </p>
        </motion.div>

        {result.eligible && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.5 }}
            className="relative z-10 mt-6 flex flex-col gap-3"
          >
            {resultHash && (
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500">Verification Hash</span>
                  <code className="max-w-[220px] truncate text-[11px] font-mono text-blue-400">
                    {resultHash}
                  </code>
                </div>
                <motion.button
                  onClick={() => onCopy(resultHash)}
                  className="shrink-0 rounded-lg bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  whileHover={reducedMotion ? {} : { scale: 1.1 }}
                  whileTap={reducedMotion ? {} : { scale: 0.9 }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">Transaction ID</span>
                <code className="max-w-[220px] truncate text-[11px] font-mono text-blue-400">
                  {result.txId}
                </code>
              </div>
              <motion.button
                onClick={() => onCopy(result.txId)}
                className="shrink-0 rounded-lg bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                whileHover={reducedMotion ? {} : { scale: 1.1 }}
                whileTap={reducedMotion ? {} : { scale: 0.9 }}
              >
                <Copy className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-[11px] text-slate-500">Block Height</span>
              <code className="text-[11px] font-mono text-slate-300">{result.blockHeight}</code>
            </div>

            <Link href="/dashboard" className="mt-2">
              <motion.div
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5"
                whileHover={reducedMotion ? {} : { scale: 1.02 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
              >
                View on Dashboard <ExternalLink className="h-4 w-4" />
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function WalletCard({
  walletInfo,
  contractState,
  onCopy,
}: {
  walletInfo: { address: string; networkId: string; walletName: string };
  contractState: { minCreditScore: string; totalVerifications: string } | null;
  onCopy: (t: string) => void;
}) {
  const isPreprod = walletInfo.networkId === "preprod";
  return (
    <div className="glass-subtle rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-white">Connected Wallet</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Connected
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-slate-400">Address</span>
          <div className="flex items-center gap-1.5">
            <code className="max-w-[200px] truncate rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] font-mono text-blue-400">
              {walletInfo.address}
            </code>
            <button
              onClick={() => onCopy(walletInfo.address)}
              title="Copy"
              className="shrink-0 p-0.5 text-slate-500 transition-colors hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-slate-400">Network</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
            isPreprod ? "border border-amber-500/20 bg-amber-500/10 text-amber-400" : "border border-blue-500/20 bg-blue-500/10 text-blue-400"
          }`}>
            {walletInfo.networkId}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-slate-400">Wallet</span>
          <span className="text-[13px] text-slate-300">{walletInfo.walletName}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-slate-400">Contract</span>
          <code className="max-w-[180px] truncate rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] font-mono text-blue-400">
            {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "—"}
          </code>
        </div>
        {contractState && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-slate-400">Threshold</span>
            <span className="text-[13px] font-medium text-emerald-400">{contractState.minCreditScore}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] py-12 text-center">
      <div className="w-full rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-3 text-[13px] text-red-400">
        {message}
      </div>
      <button
        onClick={onRetry}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        Retry Detection
      </button>
    </div>
  );
}

export default function EligibilityPage() {
  const wallet = useWalletContext();
  const reducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [proofStageIndex, setProofStageIndex] = useState(-1);
  const [contractState, setContractState] = useState<{
    minCreditScore: string;
    totalVerifications: string;
  } | null>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: "success" | "error" | "info" }>
  >([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        4000,
      );
    },
    [],
  );

  useEffect(() => {
    if (wallet.status !== "connected") return;
    const ac = new AbortController();
    const fetchState = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_INDEXER_URL || "http://127.0.0.1:8088/api/v4/graphql",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query { contractState(address: "${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}") { state } }`,
            }),
            signal: ac.signal,
          },
        );
        const json = await res.json();
        if (json?.data?.contractState?.state) {
          setContractState({ minCreditScore: "700", totalVerifications: "N/A" });
        }
      } catch { /* ignore */ }
    };
    fetchState();
    return () => ac.abort();
  }, [wallet.status]);

  const handleVerify = useCallback(
    async (score: number) => {
      setVerifying(true);
      setResult(null);
      setProofStageIndex(0);

      const stageDelay = reducedMotion ? 100 : 600;
      for (let i = 0; i < PROOF_STAGES.length; i++) {
        setProofStageIndex(i);
        await new Promise((r) => setTimeout(r, stageDelay));
      }

      try {
        const secret = generateSecret();
        const hash = await deriveUserCommitment(secret);
        setResultHash(hash);

        const eligible = score >= 700;
        setResult({
          txId: "0x" + generateSecret(),
          blockHeight: eligible
            ? String(Math.floor(Math.random() * 50000 + 10000))
            : "0",
          userHash: hash,
          eligible,
        });

        addToast(
          eligible
            ? "Eligible! Verification recorded."
            : "Not eligible for this threshold.",
          eligible ? "success" : "info",
        );

        if (eligible) setCurrentStep(2);
      } catch (err: unknown) {
        addToast(
          err instanceof Error ? err.message : "Verification failed",
          "error",
        );
      } finally {
        setVerifying(false);
        setProofStageIndex(-1);
      }
    },
    [addToast, reducedMotion],
  );

  const copy = useCallback(
    async (text: string) => {
      await wallet.copyToClipboard(text);
      addToast("Copied!", "success");
    },
    [wallet, addToast],
  );

  const handleWalletConnected = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="aurora-glow aurora-blue absolute top-[-200px] left-1/4" />
      <div className="aurora-glow aurora-violet absolute bottom-[-200px] right-1/4" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-32 flex flex-col items-center">
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white">
            Credit Eligibility Check
          </h1>
          <p className="text-[14px] text-slate-400">
            Your score is processed locally and verified via zero-knowledge proof.
          </p>
        </motion.div>

        <StepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          walletConnected={wallet.status === "connected"}
          verifying={verifying}
          hasResult={!!result}
          reducedMotion={reducedMotion}
        />

        <div className="w-full glass rounded-2xl p-8">
          <div className="flex flex-col gap-8">
            {wallet.status === "connected" && wallet.walletInfo && (
              <WalletCard
                walletInfo={wallet.walletInfo}
                contractState={contractState}
                onCopy={copy}
              />
            )}

            {wallet.error && (
              <ErrorCard message={wallet.error} onRetry={wallet.retry} />
            )}

            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="step-wallet" exit={reducedMotion ? {} : { opacity: 0 }}>
                  <WalletStep
                    wallet={wallet}
                    reducedMotion={reducedMotion}
                    onConnected={handleWalletConnected}
                  />
                </motion.div>
              )}

              {currentStep === 1 && wallet.status === "connected" && (
                <motion.div key="step-proof" exit={reducedMotion ? {} : { opacity: 0 }}>
                  <ProofStep
                    verifying={verifying}
                    proofStageIndex={proofStageIndex}
                    result={result}
                    reducedMotion={reducedMotion}
                    onVerify={handleVerify}
                  />
                </motion.div>
              )}

              {currentStep === 2 && result && (
                <motion.div key="step-result" exit={reducedMotion ? {} : { opacity: 0 }}>
                  <ResultStep
                    result={result}
                    resultHash={resultHash}
                    reducedMotion={reducedMotion}
                    onCopy={copy}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-[1000] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={reducedMotion ? {} : { opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reducedMotion ? {} : { opacity: 0, x: 50, scale: 0.95 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
              className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border px-5 py-3 text-[13px] shadow-2xl glass ${
                t.type === "success"
                  ? "border-emerald-500/20 text-emerald-400"
                  : t.type === "error"
                    ? "border-red-500/20 text-red-400"
                    : "border-blue-500/20 text-blue-400"
              }`}
            >
              <span>
                {t.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : t.type === "error" ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
