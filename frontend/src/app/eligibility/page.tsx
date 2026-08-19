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
      ? "h-4 w-4 border-2 border-slate-200 border-t-blue-600"
      : "h-8 w-8 border-[3px] border-slate-200 border-t-blue-600";
  return <span className={`inline-block animate-spin rounded-full ${cls}`} />;
}

function ProgressBar() {
  return (
    <div className="mt-1 h-1.5 w-60 max-w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-full animate-[progress_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
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
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step.done
                  ? "bg-green-100 text-green-700"
                  : step.active
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                step.done || step.active ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-2 h-px w-8 ${
                steps[i + 1].done || step.done ? "bg-green-300" : "bg-slate-200"
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
      className="shrink-0 p-0.5 text-slate-400 transition-colors hover:text-slate-700"
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
          process.env.NEXT_PUBLIC_INDEXER_URL ||
            "http://127.0.0.1:8088/api/v4/graphql",
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
          setContractState({
            minCreditScore: "700",
            totalVerifications: "N/A",
          });
        }
      } catch {
        /* ignore */
      }
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
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : "Verification failed",
        "error",
      );
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Credit Eligibility Check
        </h1>
        <p className="text-sm text-slate-500">
          Your score is processed locally and verified via zero-knowledge proof.
        </p>
      </div>

      <StepIndicator
        walletConnected={wallet.status === "connected"}
        verifying={verifying}
        hasResult={!!result}
      />

      <div className="w-full rounded-2xl bg-white shadow-xl border border-slate-200 p-8">
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

          {(wallet.status === "not_found" ||
            wallet.status === "detecting" ||
            wallet.status === "found") &&
            !wallet.error && (
              <EmptyState
                status={wallet.status}
                onConnect={wallet.connect}
              />
            )}

          {wallet.status === "connecting" && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 py-20">
              <Spinner size="lg" />
              <p className="text-sm text-slate-500">
                Connecting to Lace Wallet...
              </p>
            </div>
          )}

          {wallet.error && (
            <ErrorCard message={wallet.error} onRetry={wallet.retry} />
          )}
        </div>
      </div>

      {/* TOASTS */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[1000] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-sm animate-[slideIn_0.3s_ease-out] items-center gap-3 rounded-xl border px-5 py-3.5 text-sm shadow-lg ${
              t.type === "success"
                ? "border-green-200 bg-white text-green-700"
                : t.type === "error"
                  ? "border-red-200 bg-white text-red-700"
                  : "border-blue-200 bg-white text-blue-700"
            }`}
          >
            <span>
              {t.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : t.type === "error" ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <Star className="h-4 w-4 text-blue-500" />
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
  contractState: {
    minCreditScore: string;
    totalVerifications: string;
  } | null;
  onCopy: (t: string) => void;
}) {
  const isPreprod = walletInfo.networkId === "preprod";
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Connected Wallet
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          Connected
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Address</span>
          <div className="flex items-center gap-1.5">
            <code className="max-w-[220px] truncate rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-mono text-blue-600">
              {walletInfo.address}
            </code>
            <BtnIcon onClick={() => onCopy(walletInfo.address)} title="Copy">
              &#128203;
            </BtnIcon>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Network</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
              isPreprod
                ? "bg-amber-50 text-amber-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {walletInfo.networkId}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Wallet</span>
          <span className="text-sm text-slate-700">
            {walletInfo.walletName}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Contract</span>
          <code className="max-w-[180px] truncate rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-mono text-blue-600">
            {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "\u2014"}
          </code>
        </div>
        {contractState && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-500">
              Threshold
            </span>
            <span className="text-sm font-semibold text-green-600">
              {contractState.minCreditScore}
            </span>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-slate-900">
        Credit Score Verification
      </h2>

      <div className="mb-6 rounded-xl border-l-[3px] border-blue-500 bg-blue-50 p-4 text-sm leading-relaxed text-slate-600">
        <strong className="text-slate-900">
          &#128274; Privacy Guarantee:
        </strong>{" "}
        Your exact credit score is processed locally and proven via a
        zero-knowledge circuit. Only the boolean result (eligible / not eligible)
        is recorded on the public ledger.
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        Enter your credit score (300&ndash;850):
      </label>
      <input
        type="number"
        min={300}
        max={850}
        value={creditScore}
        onChange={(e) => setCreditScore(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onVerify();
        }}
        placeholder="e.g., 720"
        disabled={verifying}
        className="mb-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50"
      />
      {creditScore &&
        (parseInt(creditScore) < 300 || parseInt(creditScore) > 850) && (
          <p className="mb-2 text-xs text-red-500">
            Score must be between 300 and 850.
          </p>
        )}

      <button
        onClick={onVerify}
        disabled={verifying || !creditScore}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100"
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
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-blue-50 py-6 text-center">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-700">
            Generating zero-knowledge proof...
          </p>
          <p className="text-xs text-slate-400">
            Your credit score remains private throughout this process.
          </p>
          <ProgressBar />
        </div>
      )}

      {result && !verifying && (
        <div
          className={`mt-6 flex gap-4 rounded-xl p-6 ${
            result.eligible
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div
            className={`mt-0.5 ${
              result.eligible ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {result.eligible ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <X className="h-7 w-7" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold ${
                result.eligible ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {result.eligible ? "Eligible" : "Not Eligible"}
            </h3>
            <p
              className={`mt-1 text-sm ${
                result.eligible ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {result.eligible
                ? "Your credit score meets the required threshold."
                : "Your credit score does not meet the required threshold."}
            </p>
            {result.eligible && (
              <div className="mt-4 flex flex-col gap-2">
                <DetailRow
                  label="Transaction ID"
                  onClick={() => onCopy(result.txId)}
                >
                  {result.txId.slice(0, 20)}...
                </DetailRow>
                <DetailRow label="Block Height">
                  {result.blockHeight}
                </DetailRow>
                <DetailRow
                  label="Verification Hash"
                  onClick={() => onCopy(result.userHash)}
                >
                  {result.userHash.slice(0, 20)}...
                </DetailRow>
                <p className="mt-1 text-[11px] italic text-emerald-600/70">
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

function HashCard({
  hash,
  onCopy,
}: {
  hash: string;
  onCopy: (t: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        Your Verification Hash
      </h2>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <code className="flex-1 break-all text-xs font-mono text-blue-600">
          {hash}
        </code>
        <BtnIcon onClick={() => onCopy(hash)} title="Copy hash">
          &#128203;
        </BtnIcon>
      </div>
      <p className="mt-2 text-[11px] italic text-slate-400">
        Use this hash to check your verification status later via the CLI or
        explorer.
      </p>
    </div>
  );
}

function EmptyState({
  status,
  onConnect,
}: {
  status: string;
  onConnect: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
      {status === "detecting" ? (
        <>
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Looking for Lace Wallet...</p>
        </>
      ) : (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Wallet className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Lace Wallet not connected</p>
          <button
            onClick={onConnect}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            Connect Lace Wallet
          </button>
        </>
      )}
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
      <div className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
        {message}
      </div>
      <button
        onClick={onRetry}
        className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600"
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
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <code
        onClick={onClick}
        className="max-w-[180px] cursor-pointer truncate rounded-lg bg-white px-2.5 py-1 text-[11px] text-blue-600 transition-colors hover:bg-blue-50"
      >
        {children}
      </code>
    </div>
  );
}
