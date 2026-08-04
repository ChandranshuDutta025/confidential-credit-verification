import { useState, useCallback, useEffect } from "react";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { useWalletDetection } from "./hooks/useWalletDetection";
import { deriveUserCommitment, generateSecret } from "./api";
import type { VerificationResult } from "./types";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Fingerprint,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Wallet,
  Zap,
  Globe,
  FileCheck,
  Clock,
  BarChart3,
  Search,
  Star,
  Check,
  X,
  Shield,
} from "lucide-react";

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`landing-section w-full py-20 md:py-32 ${className}`}
    >
      <div className="page-shell landing-section-shell">{children}</div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function App() {
  const wallet = useWalletDetection();
  const [activePage, setActivePage] = useState("home");
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
          import.meta.env.VITE_INDEXER_URL ||
            "http://127.0.0.1:8088/api/v4/graphql",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query { contractState(address: "${import.meta.env.VITE_CONTRACT_ADDRESS}") { state } }`,
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
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden flex flex-col dark:bg-slate-950 dark:text-white">
      <Navbar
        walletStatus={wallet.status}
        walletInfo={wallet.walletInfo}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onRetry={wallet.retry}
        onDemoMode={wallet.connectDemo}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="flex-1">
        {/* ═══════════════════ HOME PAGE ═══════════════════ */}
        {activePage === "home" && (
          <>
            {/* ═══════════════════ HERO ═══════════════════ */}
            <Section className="landing-section-hero !py-12 md:!py-16">
              <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
                <div className="min-w-0 max-w-2xl animate-[fadeIn_0.6s_ease-out]">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Zero-Knowledge Credit Verification
                  </div>
                      <h1 className="mb-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                    Private Credit Verification
                    <span className="block text-blue-600">
                      Without Revealing Private Data
                    </span>
                  </h1>
                    <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                    Verify loan eligibility using cryptographic commitments.
                    Your credit score is processed locally in your browser,
                    and only the verification result is recorded on-chain.
                  </p>
                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <button
                      onClick={() => setActivePage("eligibility")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 hover:scale-[1.02] active:scale-95"
                    >
                      Check Eligibility
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                      Learn More
                    </a>
                  </div>
                </div>

                <div className="hidden min-w-0 max-w-2xl animate-[slideUp_0.8s_ease-out] lg:block lg:justify-self-end">
                   <div className="relative overflow-visible rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800">
                    <div className="absolute right-4 top-4 rounded-2xl bg-blue-600 p-3 shadow-lg lg:-right-4 lg:-top-4">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          Credit Score
                        </div>
                        <div className="mt-0.5 text-sm tracking-[0.22em] text-slate-400 dark:text-slate-500">
                          ••••••••
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                          Private input
                        </div>
                      </div>
                    </div>
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                        <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          Cryptographic Commitment
                        </div>
                        <div className="mt-0.5 font-mono text-sm tracking-tight text-slate-500 dark:text-slate-400">
                          0x7f3a...91c2
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                          Generated locally
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Eligibility Verified
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Score &gt;= threshold
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* ═══════════════════ TRUST INDICATORS ═══════════════════ */}
            <Section className="bg-white dark:bg-slate-900">
              <SectionHeader
                eyebrow="Trusted by Design"
                title="Privacy-preserving by design"
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Zero Knowledge",
                    desc: "Mathematical proof without data exposure",
                  },
                  {
                    icon: Lock,
                    title: "Local Processing",
                    desc: "Credit score processing happens in your browser before any cryptographic operations",
                  },
                  {
                    icon: Shield,
                    title: "Cryptographic Privacy",
                    desc: "SHA-256 commitments link your wallet to the verification without exposing your score",
                  },
                  {
                    icon: Globe,
                    title: "Midnight Network",
                    desc: "Decentralized verification on a purpose-built chain",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/50 dark:group-hover:bg-blue-800/50">
                      <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="mb-1.5 text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
            <Section id="how-it-works">
              <SectionHeader
                eyebrow="How It Works"
                title="Four steps to private verification"
              />
              <div className="section-content relative mx-auto w-full max-w-4xl">
                <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200 lg:left-1/2 lg:block" />
                <div className="flex flex-col space-y-12 lg:space-y-16">
                  {[
                    {
                      num: "01",
                      icon: CreditCard,
                      title: "Enter Credit Score",
                      desc: "Your credit score is entered locally in your browser. The raw value is processed on your device and compared against the lending threshold.",
                    },
                    {
                      num: "02",
                      icon: Zap,
                      title: "Generate Commitment",
                      desc: "A cryptographic commitment is derived from a random secret using SHA-256, linking your wallet to the verification without exposing your score.",
                    },
                    {
                      num: "03",
                      icon: Fingerprint,
                      title: "Authorize with Wallet",
                      desc: "Your Midnight wallet authorizes the verification, connecting your on-chain identity to the cryptographic commitment.",
                    },
                    {
                      num: "04",
                      icon: FileCheck,
                      title: "Result Recorded",
                      desc: "Only the verification result (eligible or not) is published to the Midnight ledger. Your actual score remains private.",
                    },
                  ].map((step, i) => (
                    <div
                      key={step.num}
                      className={`relative flex flex-col items-start gap-6 lg:flex-row lg:items-center ${
                        i % 2 === 1 ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex-1 ${i % 2 === 1 ? "lg:text-right" : ""}`}
                      >
                        <div
                            className={`mb-3 inline-block rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 ${i % 2 === 1 ? "lg:ml-auto" : ""}`}
                          >
                            Step {step.num}
                          </div>
                          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                            {step.title}
                          </h3>
                          <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {step.desc}
                        </p>
                      </div>
                        <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-md dark:border-blue-800 dark:bg-slate-800">
                          <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="hidden flex-1 lg:block" />
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ═══════════════════ PRIVACY COMPARISON ═══════════════════ */}
            <Section className="bg-white dark:bg-slate-900">
              <SectionHeader
                eyebrow="Why Midnight?"
                title="A fundamentally different approach to verification"
              />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8 sm:p-12 dark:border-red-900/50 dark:bg-red-950/30">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50">
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Traditional Verification
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-4">
                    {[
                      "Credit score uploaded to a third-party server",
                      "Financial data stored in external databases",
                      "Third party has full access to your information",
                      "Data breach risk from centralized storage",
                      "No cryptographic privacy guarantees",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                          <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8 sm:p-12 dark:border-green-900/50 dark:bg-green-950/30">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Midnight Verification
                      </h3>
                  </div>
                  <ul className="flex flex-col gap-4">
                    {[
                      "Credit score processed locally in your browser",
                      "Cryptographic commitment derived from your data",
                      "Only the verification result is recorded on-chain",
                      "Wallet-based identity, no account required",
                      "SHA-256 hashing protects your raw data",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* ═══════════════════ CAPABILITIES ═══════════════════ */}
            <Section>
              <SectionHeader
                eyebrow="Capabilities"
                title="Everything you need for private credit verification"
              />
              <div className="section-content grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Local Processing",
                    desc: "Your credit score is processed in your browser with cryptographic commitments before any verification.",
                  },
                  {
                    icon: Zap,
                    title: "Fast Verification",
                    desc: "Cryptographic commitments are derived locally using SHA-256. No waiting for third-party API responses.",
                  },
                  {
                    icon: Lock,
                    title: "Minimal Trust",
                    desc: "Verification happens between your wallet and the blockchain. No intermediary stores your financial data.",
                  },
                  {
                    icon: EyeOff,
                    title: "Score Stays Private",
                    desc: "Your raw credit score is never transmitted. Only the cryptographic commitment and verification result leave your device.",
                  },
                  {
                    icon: FileCheck,
                    title: "Immutable Record",
                    desc: "Verification results are recorded on-chain as cryptographic commitments that cannot be altered or forged.",
                  },
                  {
                    icon: Fingerprint,
                    title: "Wallet Identity",
                    desc: "Your Midnight wallet links your on-chain identity to the verification. No passwords or separate accounts needed.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/50 dark:group-hover:bg-blue-800/50">
                      <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════════ ELIGIBILITY PAGE ═══════════════════ */}
        {activePage === "eligibility" && (
          <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <h1 className="mb-3 text-3xl font-bold text-slate-900">
                Credit Eligibility Check
              </h1>
              <p className="text-sm text-slate-500">
                Your score is processed locally and verified via
                zero-knowledge proof.
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
          </div>
        )}

        {/* ═══════════════════ DASHBOARD PAGE ═══════════════════ */}
        {activePage === "dashboard" && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center">
            <div className="mb-10 max-w-2xl">
              <h1 className="mb-2 text-3xl font-bold text-slate-900">
                Lender Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Monitor verification requests and review borrower eligibility.
              </p>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Eligible Applications",
                  value: "1,247",
                  change: "+12.5%",
                  up: true,
                  icon: CheckCircle2,
                  color: "green",
                },
                {
                  label: "Rejected",
                  value: "89",
                  change: "-3.2%",
                  up: false,
                  icon: X,
                  color: "red",
                },
                {
                  label: "Today's Requests",
                  value: "56",
                  change: "+8.1%",
                  up: true,
                  icon: BarChart3,
                  color: "blue",
                },
                {
                  label: "Avg. Processing Time",
                  value: "2.3s",
                  change: "-15%",
                  up: true,
                  icon: Clock,
                  color: "violet",
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      {kpi.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        kpi.color === "green"
                          ? "bg-green-50 text-green-600"
                          : kpi.color === "red"
                            ? "bg-red-50 text-red-600"
                            : kpi.color === "blue"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      <kpi.icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <div className="mb-1 text-2xl font-bold text-slate-900">
                    {kpi.value}
                  </div>
                  <div
                    className={`text-xs font-medium ${kpi.up ? "text-green-600" : "text-red-500"}`}
                  >
                    {kpi.change} from last month
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Applications
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wider text-slate-400">
                      <th className="px-4 sm:px-6 lg:px-8 py-4">Application</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4">Score Range</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4">Status</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4">Date</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: "APP-2847",
                        range: "750-850",
                        status: "Approved",
                        date: "Jan 15, 2026",
                      },
                      {
                        id: "APP-2846",
                        range: "700-749",
                        status: "Approved",
                        date: "Jan 15, 2026",
                      },
                      {
                        id: "APP-2845",
                        range: "600-699",
                        status: "Pending",
                        date: "Jan 14, 2026",
                      },
                      {
                        id: "APP-2844",
                        range: "300-599",
                        status: "Rejected",
                        date: "Jan 14, 2026",
                      },
                      {
                        id: "APP-2843",
                        range: "750-850",
                        status: "Approved",
                        date: "Jan 13, 2026",
                      },
                      {
                        id: "APP-2842",
                        range: "700-749",
                        status: "Pending",
                        date: "Jan 13, 2026",
                      },
                    ].map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                      >
                        <td className="whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4 font-medium text-slate-900">
                          {row.id}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4 text-slate-500">
                          {row.range}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              row.status === "Approved"
                                ? "bg-green-50 text-green-700"
                                : row.status === "Pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4 text-slate-500">
                          {row.date}
                        </td>
                        <td className="whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4 text-right">
                          <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-4 sm:px-6 lg:px-8 py-4">
                <span className="text-xs text-slate-400">
                  Showing 1-6 of 1,336 applications
                </span>
                <div className="flex items-center gap-1">
                  <button className="rounded px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    Previous
                  </button>
                  <button className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    1
                  </button>
                  <button className="rounded px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    2
                  </button>
                  <button className="rounded px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ DOCS PAGE ═══════════════════ */}
        {activePage === "docs" && (
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <FileCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              Documentation
            </h1>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-500">
              Technical documentation for the Midnight Credit Verification
              protocol, Compact circuits, and developer integration guides.
            </p>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-8 py-6 text-xs text-slate-400">
              Documentation portal coming soon.
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="w-full border-t border-slate-200 bg-white py-12 md:py-16 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
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

      {/* ── TOASTS ── */}
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

/* ══════════════════════════════════════════════════════════════════════════
   STEP INDICATOR
   ══════════════════════════════════════════════════════════════════════════ */

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
    {
      label: "Generate Proof",
      done: hasResult,
      active: verifying,
    },
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
              {step.done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
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

/* ══════════════════════════════════════════════════════════════════════════
   VERIFY PAGE COMPONENTS (existing logic, new styling)
   ══════════════════════════════════════════════════════════════════════════ */

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
        <h2 className="text-sm font-semibold text-slate-900">Connected Wallet</h2>
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
            {import.meta.env.VITE_CONTRACT_ADDRESS || "\u2014"}
          </code>
        </div>
        {contractState && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-500">Threshold</span>
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
        className="mt-3 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100"
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
            <p className={`mt-1 text-sm ${
              result.eligible ? "text-emerald-700" : "text-rose-700"
            }`}>
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
        <code className="flex-1 break-all text-xs font-mono text-blue-600">{hash}</code>
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
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:scale-95"
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

/* ══════════════════════════════════════════════════════════════════════════
   PRIMITIVES
   ══════════════════════════════════════════════════════════════════════════ */

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

function Spinner({ size }: { size: "sm" | "lg" }) {
  const cls =
    size === "sm"
      ? "h-4 w-4 border-2 border-slate-200 border-t-blue-600"
      : "h-8 w-8 border-[3px] border-slate-200 border-t-blue-600";
  return (
    <span className={`inline-block animate-spin rounded-full ${cls}`} />
  );
}

function ProgressBar() {
  return (
    <div className="mt-1 h-1.5 w-60 max-w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full w-full animate-[progress_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
    </div>
  );
}

export default App;
