"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Fingerprint,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Zap,
  Globe,
  FileCheck,
  X,
  Check,
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

export default function HomePage() {
  return (
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
              Verify loan eligibility using cryptographic commitments. Your
              credit score is processed locally in your browser, and only the
              verification result is recorded on-chain.
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 hover:scale-[1.02] active:scale-95"
              >
                Check Eligibility
                <ArrowRight className="h-5 w-5" />
              </Link>
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
                    &#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;
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
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item}
                  </span>
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
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item}
                  </span>
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
  );
}
