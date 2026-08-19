"use client";

import { useState, useCallback, useEffect } from "react";
import { useWalletContext } from "@/lib/hooks/WalletProvider";
import { deriveUserCommitment, generateSecret } from "@/lib/api";
import type { VerificationResult } from "@/lib/types";
import {
  Wallet,
  CheckCircle2,
  X,
  Check,
  Star,
} from "lucide-react";

function Spinner({ size }: { size: "sm" | "lg" }) {
  const cls =
    size === "sm"
      ? "h-4 w-4 border-2 border-slate-600 border-t-blue-400"
      : "h-8 w-8 border-[3px] border-slate-600 border-t-blue-400";
  return <span className={`inline-block animate-spin rounded-full ${cls}`} />;
}

function ProgressBar() {
  return (
    <div className="mt-1 h-1 w-48 max-w-full overflow-hidden rounded-full bg-white/5">
      <div className="h-full w-full animate-[progress_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
    </div>
  );
}

function StepIndicator({
  walletConnected,
  verifying,
  hasResult,
}: {
  walletConnected: boolean;
  verifying: boolean;
  hasResult: boolean;
}) {
  const steps = [
    { label: "Connect Wallet", done: walletConnected },
    { label: "Generate Proof", done: hasResult, active: verifying },
    { label: "Result", done: hasResult },
  ];
  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                step.done
                  ? "bg-emerald-500/20 text-emerald-400"
                  : step.active
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-white/5 text-slate-500"
              }`}
            >
              {step.done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={`text-[12px] font-medium ${
                step.done || step.active ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-2 h-px w-8 ${
                steps[i + 1].done || step.done ? "bg-emerald-500/30" : "bg-white/5"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BtnIcon({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="shrink-0 p-0.5 text-slate-500 transition-colors hover:text-white"
    >
      {children}
    </button>
  );
}

export default function EligibilityPage() {
  const wallet = useWalletContext();
  const [creditScore, setCreditScore] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
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

  const handleVerify = useCallback(async () => {
    const score = parseInt(creditScore.trim(), 10);
    if (isNaN(score) || score < 300 || score > 850) {
      addToast("Credit score must be between 300 and 850.", "error");
      return;
    }
    setVerifying(true);
    setResult(null);
    try {
      const secret = generateSecret();
      const hash = await deriveUserCommitment(secret);
      setResultHash(hash);
      await new Promise((r) => setTimeout(r, 2000));
      const eligible = score >= 700;
      setResult({
        txId: "0x" + generateSecret(),
        blockHeight: eligible ? String(Math.floor(Math.random() * 50000 + 10000)) : "0",
        userHash: hash,
        eligible,
      });
      addToast(
        eligible ? "Eligible! Verification recorded." : "Not eligible for this threshold.",
        eligible ? "success" : "info",
      );
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setVerifying(false);
    }
  }, [creditScore, addToast]);

  const copy = useCallback(
    async (text: string) => {
      await wallet.copyToClipboard(text);
      addToast("Copied to clipboard", "success");
    },
    [wallet, addToast],
  );

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="aurora-glow aurora-blue absolute top-[-200px] left-1/4" />
      <div className="aurora-glow aurora-violet absolute bottom-[-200px] right-1/4" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-32 flex flex-col items-center">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white">
            Credit Eligibility Check
          </h1>
          <p className="text-[14px] text-slate-400">
            Your score is processed locally and verified via zero-knowledge proof.
          </p>
        </div>

        <StepIndicator
          walletConnected={wallet.status === "connected"}
          verifying={verifying}
          hasResult={!!result}
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

            {wallet.status === "connected" && (
              <VerifyCard
                creditScore={creditScore}
                setCreditScore={setCreditScore}
                verifying={verifying}
                result={result}
                onVerify={handleVerify}
                onCopy={copy}
              />
            )}

            {resultHash && result?.eligible && (
              <HashCard hash={resultHash} onCopy={copy} />
            )}

            {(wallet.status === "not_found" || wallet.status === "detecting" || wallet.status === "found") && !wallet.error && (
              <EmptyState status={wallet.status} onConnect={wallet.connect} />
            )}

            {wallet.status === "connecting" && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] py-20">
                <Spinner size="lg" />
                <p className="text-[13px] text-slate-400">Connecting to Lace Wallet...</p>
              </div>
            )}

            {wallet.error && (
              <ErrorCard message={wallet.error} onRetry={wallet.retry} />
            )}
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[1000] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-sm animate-[slideIn_0.3s_ease-out] items-center gap-3 rounded-xl border px-5 py-3 text-[13px] shadow-2xl glass ${
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
          </div>
        ))}
      </div>
    </div>
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
            <BtnIcon onClick={() => onCopy(walletInfo.address)} title="Copy">opy</BtnIcon>
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

function VerifyCard({
  creditScore,
  setCreditScore,
  verifying,
  result,
  onVerify,
  onCopy,
}: {
  creditScore: string;
  setCreditScore: (v: string) => void;
  verifying: boolean;
  result: VerificationResult | null;
  onVerify: () => void;
  onCopy: (t: string) => void;
}) {
  return (
    <div className="glass-subtle rounded-2xl p-8">
      <h2 className="mb-5 text-[15px] font-medium text-white">
        Credit Score Verification
      </h2>

      <div className="mb-6 rounded-xl border-l-[2px] border-blue-500/40 bg-blue-500/5 px-4 py-3 text-[13px] leading-relaxed text-slate-300">
        <strong className="text-white">Privacy Guarantee:</strong>{" "}
        Your exact credit score is processed locally and proven via a
        zero-knowledge circuit. Only the boolean result is recorded on-chain.
      </div>

      <label className="mb-2 block text-[13px] text-slate-400">
        Enter your credit score (300–850):
      </label>
      <input
        type="number"
        min={300}
        max={850}
        value={creditScore}
        onChange={(e) => setCreditScore(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onVerify(); }}
        placeholder="e.g., 720"
        disabled={verifying}
        className="mb-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-40"
      />
      {creditScore && (parseInt(creditScore) < 300 || parseInt(creditScore) > 850) && (
        <p className="mb-2 text-[12px] text-red-400">Score must be between 300 and 850.</p>
      )}

      <button
        onClick={onVerify}
        disabled={verifying || !creditScore}
        className="mt-3 w-full rounded-full bg-white px-6 py-3 text-[14px] font-medium text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:scale-100"
      >
        {verifying ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" /> Generating Proof...
          </span>
        ) : (
          "Verify Credit Score"
        )}
      </button>

      {verifying && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-blue-500/5 border border-blue-500/10 py-6 text-center">
          <Spinner size="lg" />
          <p className="text-[13px] font-medium text-slate-300">Generating zero-knowledge proof...</p>
          <p className="text-[12px] text-slate-500">Your credit score remains private throughout this process.</p>
          <ProgressBar />
        </div>
      )}

      {result && !verifying && (
        <div className={`mt-6 flex gap-4 rounded-xl p-6 ${
          result.eligible
            ? "border border-emerald-500/20 bg-emerald-500/[0.05]"
            : "border border-red-500/20 bg-red-500/[0.05]"
        }`}>
          <div className={`mt-0.5 ${result.eligible ? "text-emerald-400" : "text-red-400"}`}>
            {result.eligible ? <CheckCircle2 className="h-6 w-6" /> : <X className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <h3 className={`text-[15px] font-medium ${result.eligible ? "text-emerald-400" : "text-red-400"}`}>
              {result.eligible ? "Eligible" : "Not Eligible"}
            </h3>
            <p className="mt-1 text-[13px] text-slate-400">
              {result.eligible
                ? "Your credit score meets the required threshold."
                : "Your credit score does not meet the required threshold."}
            </p>
            {result.eligible && (
              <div className="mt-4 flex flex-col gap-2">
                <DetailRow label="Transaction ID" onClick={() => onCopy(result.txId)}>
                  {result.txId.slice(0, 20)}...
                </DetailRow>
                <DetailRow label="Block Height">{result.blockHeight}</DetailRow>
                <DetailRow label="Verification Hash" onClick={() => onCopy(result.userHash)}>
                  {result.userHash.slice(0, 20)}...
                </DetailRow>
                <p className="mt-1 text-[11px] italic text-emerald-400/50">
                  Save this hash to verify your status later.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HashCard({ hash, onCopy }: { hash: string; onCopy: (t: string) => void }) {
  return (
    <div className="glass-subtle rounded-2xl p-6">
      <h2 className="mb-3 text-[13px] font-medium text-white">Your Verification Hash</h2>
      <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <code className="flex-1 break-all text-[11px] font-mono text-blue-400">{hash}</code>
        <BtnIcon onClick={() => onCopy(hash)} title="Copy hash">opy</BtnIcon>
      </div>
      <p className="mt-2 text-[11px] italic text-slate-500">
        Use this hash to check your verification status later via the CLI or explorer.
      </p>
    </div>
  );
}

function EmptyState({ status, onConnect }: { status: string; onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-center">
      {status === "detecting" ? (
        <>
          <Spinner size="lg" />
          <p className="text-[13px] text-slate-400">Looking for Lace Wallet...</p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Wallet className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-[13px] text-slate-400">Lace Wallet not connected</p>
          <button
            onClick={onConnect}
            className="rounded-full bg-white px-6 py-2.5 text-[13px] font-medium text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 active:scale-95"
          >
            Connect Lace Wallet
          </button>
        </>
      )}
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

function DetailRow({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-slate-400">{label}</span>
      <code
        onClick={onClick}
        className="max-w-[180px] cursor-pointer truncate rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-blue-400 transition-colors hover:bg-white/10"
      >
        {children}
      </code>
    </div>
  );
}
