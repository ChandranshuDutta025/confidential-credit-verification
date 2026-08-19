"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Fingerprint,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Zap,
  FileCheck,
  X,
  Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const heroLineVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADER — Reusable for all major sections
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionHeader({
  label,
  heading,
  description,
  align = "center",
}: {
  label: string;
  heading: string;
  description?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={`mx-auto mb-16 max-w-3xl ${
        isCenter ? "text-center" : "text-left"
      }`}
    >
      <motion.p
        variants={fadeUp}
        className="mb-5 text-[13px] font-semibold uppercase tracking-[0.2em] text-blue-400"
      >
        {label}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        className="mb-5 text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-[3rem]"
      >
        {heading}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
          className="text-lg leading-relaxed text-slate-400 max-w-[680px] mx-auto"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION DIVIDER — Subtle gradient line with optional glow
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionDivider({ glow = false }: { glow?: boolean }) {
  return (
    <div className="relative mx-auto max-w-5xl py-16">
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {glow && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[40px] rounded-full bg-blue-500/[0.04] blur-[40px] pointer-events-none" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroSection() {
  const reduceMotion = useReducedMotion();
  const stagger = reduceMotion ? 0 : 0.08;
  const delay1 = reduceMotion ? 0 : 0.2;
  const delay2 = reduceMotion ? 0 : 0.28;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dot-grid opacity-40" />
      <div className="aurora-glow aurora-blue mesh-drift absolute top-[-200px] left-1/4" />
      <div className="aurora-glow aurora-indigo mesh-drift-slow absolute top-[-100px] right-1/4" />
      <div className="aurora-glow aurora-violet mesh-drift absolute bottom-[-300px] left-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-blue-500/[0.07] blur-[120px] pointer-events-none mesh-drift-slow" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-indigo-500/[0.05] blur-[100px] pointer-events-none mesh-drift" />

      <div className="relative z-10 page-shell w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                Zero-Knowledge Credit Verification
              </span>
            </div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger } },
              }}
              className="mb-6 text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[4rem]"
            >
              <motion.span
                variants={heroLineVariants}
                transition={{ duration: 0.5, delay: delay1 }}
                className="block"
              >
                Prove creditworthiness.
              </motion.span>
              <motion.span
                variants={heroLineVariants}
                transition={{ duration: 0.5, delay: delay2 }}
                className="block"
              >
                <span className="gradient-text-blue">Without exposing your score.</span>
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.4 }}
              className="mb-10 max-w-[520px] text-[16px] leading-relaxed text-slate-400"
            >
              Prove you&apos;re eligible for credit without exposing your financial data.
              Your credit score is evaluated locally, while only the cryptographic
              verification result is shared on-chain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.5 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/eligibility"
                className="btn-sheen group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Check Eligibility
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[13px] font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white hover:-translate-y-0.5"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Right: Verification Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.3 }}
            className="hidden lg:block"
          >
            <VerificationFlow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VERIFICATION FLOW VISUALIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

function VerificationFlow() {
  const steps = [
    { label: "Private Input", sub: "Credit score processed locally", icon: CreditCard, color: "from-blue-500 to-blue-600" },
    { label: "Local Processing", sub: "Browser-side evaluation", icon: Zap, color: "from-cyan-500 to-blue-500" },
    { label: "Cryptographic Commitment", sub: "SHA-256 hash derivation", icon: Lock, color: "from-indigo-500 to-violet-500" },
    { label: "Zero-Knowledge Proof", sub: "Validity without disclosure", icon: ShieldCheck, color: "from-violet-500 to-purple-500" },
    { label: "Verified On-Chain", sub: "Result recorded on Midnight", icon: CheckCircle2, color: "from-emerald-500 to-green-500", final: true },
  ];

  return (
    <div className="relative flex flex-col items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="relative flex items-center z-10">
          {i < steps.length - 1 && (
            <div className="absolute left-[23px] top-[48px] w-px h-[40px] overflow-hidden">
              <div className="h-full w-full bg-gradient-to-b from-blue-500/40 to-blue-500/10" />
              <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-400/60 via-blue-300/30 to-transparent"
                style={{ animation: `progress 2s ease-in-out ${i * 0.4}s infinite` }}
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <div
              className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg ${
                step.final ? "shadow-emerald-500/20" : ""
              }`}
            >
              <step.icon className="h-5 w-5 text-white" />
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} blur-xl ${step.final ? "opacity-50" : "opacity-40"}`} />
              {step.final && (
                <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-2xl animate-pulse-glow pointer-events-none" />
              )}
            </div>
            <div className={`glass-subtle rounded-xl px-5 py-3 min-w-[220px] ${step.final ? "border-emerald-500/20" : ""}`}>
              <div className={`text-[13px] font-medium ${step.final ? "text-emerald-400" : "text-white"}`}>{step.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{step.sub}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARCHITECTURE SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function ArchitectureSection() {
  const cards = [
    {
      num: "01",
      title: "Private Input",
      desc: "Credit score is processed locally in your browser. Raw financial data never leaves your device.",
      icon: CreditCard,
      glowColor: "from-blue-500/[0.06]",
      glowPosition: "top-0 left-0",
    },
    {
      num: "02",
      title: "Cryptographic Commitment",
      desc: "A SHA-256 commitment is derived from your data, linking your wallet to the verification.",
      icon: Lock,
      glowColor: "from-violet-500/[0.06]",
      glowPosition: "top-0 right-0",
    },
    {
      num: "03",
      title: "On-Chain Verification",
      desc: "Only the verification result is recorded on the Midnight ledger. Your data stays private.",
      icon: CheckCircle2,
      glowColor: "from-emerald-500/[0.06]",
      glowPosition: "bottom-0 right-0",
    },
  ];

  return (
    <section id="architecture" className="relative overflow-hidden" style={{ paddingTop: "120px", paddingBottom: "140px" }}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-blue-500/[0.03] blur-[160px] pointer-events-none" />
      <div className="aurora-glow aurora-indigo absolute top-0 right-[-200px] opacity-10" />

      <div className="relative z-10 page-shell" style={{ maxWidth: "1200px" }}>
        {/* Section header — inline for precise spacing control */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="text-[13px] font-semibold uppercase tracking-[0.2em] text-blue-400 mb-[18px]"
          >
            Architecture
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-semibold leading-[1.1] tracking-tight text-white mb-[18px]"
            style={{ fontSize: "clamp(2.1rem, 4vw, 3rem)" }}
          >
            Your data stays yours.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[17px] leading-[1.6] text-slate-400 max-w-[700px] mx-auto"
          >
            Every step of the verification process is designed to protect your privacy.
          </motion.p>
        </motion.div>

        {/* Card grid with connectors */}
        <div className="relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6"
          >
            {cards.map((card, i) => (
              <motion.div
                key={card.num}
                variants={fadeUp}
                className="relative group"
              >
                {/* Connector line (desktop only, between cards) */}
                {i < cards.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 items-center justify-center pointer-events-none">
                    <div className="w-full h-px bg-gradient-to-r from-blue-500/30 to-blue-500/10 relative overflow-visible">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-400/80 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                        style={{ animation: `connectorDot 3s ease-in-out ${i * 1}s infinite` }}
                      />
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className="relative overflow-hidden rounded-[18px] border border-white/[0.06] transition-all duration-[250ms] ease-out hover:-translate-y-[3px] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(11, 16, 32, 0.5)",
                    backdropFilter: "blur(12px)",
                    padding: "28px",
                    minHeight: "250px",
                  }}
                >
                  {/* Subtle inner glow */}
                  <div className={`absolute ${card.glowPosition} w-[200px] h-[200px] rounded-full bg-gradient-to-br ${card.glowColor} to-transparent blur-[60px] pointer-events-none`} />

                  {/* Header: step badge + icon */}
                  <div className="relative flex items-center justify-between mb-7">
                    <span className="inline-flex items-center rounded-lg bg-blue-500/10 px-2.5 py-1 text-[12px] font-mono font-bold text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                      {card.num}
                    </span>
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03] transition-all duration-[250ms] group-hover:border-blue-500/20 group-hover:bg-blue-500/[0.06] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                      <card.icon className="w-5 h-5 text-blue-400 transition-colors group-hover:text-blue-300" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="relative text-[20px] font-semibold text-white mb-3 leading-tight">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="relative text-[15px] leading-[1.6] text-slate-400" style={{ maxWidth: "330px" }}>
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROCESS SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Enter Private Score",
      desc: "Input your credit score locally in your browser. The raw value is never transmitted.",
      icon: CreditCard,
    },
    {
      num: "02",
      title: "Generate Commitment",
      desc: "A cryptographic commitment is derived using SHA-256, linking your wallet without exposing your data.",
      icon: Zap,
    },
    {
      num: "03",
      title: "Prove Eligibility",
      desc: "Your Midnight wallet authorizes the zero-knowledge proof generation.",
      icon: Fingerprint,
    },
    {
      num: "04",
      title: "Verify On-Chain",
      desc: "Only the boolean result is published to the Midnight ledger. Your score remains private.",
      icon: FileCheck,
    },
  ];

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 50%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative pt-16 pb-24">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />

      <div className="relative z-10 page-shell">
        <SectionHeader
          label="Process"
          heading="How verification works."
          description="Four steps to private, verifiable credit eligibility."
        />

        <div className="mx-auto max-w-3xl">
          <div ref={timelineRef} className="relative">
            {/* Connecting line — background */}
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent" />

            {/* Connecting line — scroll-driven fill */}
            <motion.div
              className="absolute left-[23px] top-0 w-px origin-top bg-gradient-to-b from-blue-500/50 via-indigo-500/30 to-blue-400/10"
              style={{ height: "100%", scaleY: lineHeight }}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="flex flex-col gap-12"
            >
              {steps.map((step) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="relative flex gap-6"
                >
                  {/* Node */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-[#0B1020]">
                    <step.icon className="h-5 w-5 text-blue-400" />
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <div className="mb-1.5 text-[11px] font-mono text-blue-400/60">
                      Step {step.num}
                    </div>
                    <h3 className="mb-2 text-[16px] font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="max-w-md text-[14px] leading-relaxed text-slate-400">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAPABILITIES SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function CapabilitiesSection() {
  const items = [
    { icon: ShieldCheck, title: "Local Processing", desc: "Your credit score is processed in your browser with cryptographic commitments.", why: "Zero server round-trips mean instant feedback." },
    { icon: Zap, title: "Fast Verification", desc: "Cryptographic commitments are derived locally using SHA-256. No API delays.", why: "Sub-second verification without network latency." },
    { icon: Lock, title: "Minimal Trust", desc: "Verification happens between your wallet and the blockchain. No intermediary.", why: "Eliminates single points of failure and abuse." },
    { icon: EyeOff, title: "Score Stays Private", desc: "Your raw credit score is never transmitted. Only the commitment leaves your device.", why: "Even the verifier never sees your actual score." },
    { icon: FileCheck, title: "Immutable Record", desc: "Verification results are recorded on-chain as tamper-proof commitments.", why: "Cryptographic proof that can't be forged or altered." },
    { icon: Fingerprint, title: "Wallet Identity", desc: "Your Midnight wallet links your on-chain identity. No passwords needed.", why: "Self-sovereign identity without credential leakage." },
  ];

  return (
    <section className="relative pt-16 pb-24">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />

      <div className="relative z-10 page-shell">
        <SectionHeader
          label="Capabilities"
          heading="Built for private verification."
          description="The infrastructure primitives that make confidential credit verification possible."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="group glass-subtle glow-border relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04]"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/15">
                <item.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="mb-2 text-[15px] font-medium text-white">
                {item.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-slate-400">
                {item.desc}
              </p>
              <p className="mt-3 text-[13px] italic leading-relaxed text-blue-400/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.why}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHY MIDNIGHT SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function WhyMidnightSection() {
  const leftItems = [
    "Credit score uploaded to a third-party server",
    "Financial data stored in external databases",
    "Third party has full access to your information",
    "Data breach risk from centralized storage",
    "No cryptographic privacy guarantees",
  ];
  const rightItems = [
    "Credit score processed locally in your browser",
    "Cryptographic commitment derived from your data",
    "Only the verification result is recorded on-chain",
    "Wallet-based identity, no account required",
    "SHA-256 hashing protects your raw data",
  ];

  return (
    <section className="relative pt-16 pb-24">
      <div className="aurora-glow aurora-blue absolute bottom-[-200px] left-[-200px] opacity-10" />

      <div className="relative z-10 page-shell">
        <SectionHeader
          label="Why Midnight"
          heading="A fundamentally different approach."
          description="Midnight enables zero-knowledge verification without sacrificing privacy."
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Traditional */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-8"
          >
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-[16px] font-medium text-white">Traditional Verification</h3>
            </motion.div>
            <ul className="flex flex-col gap-4">
              {leftItems.map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400/60" />
                  <span className="text-[14px] text-slate-400">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Midnight */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-8"
          >
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-[16px] font-medium text-white">Midnight Verification</h3>
            </motion.div>
            <ul className="flex flex-col gap-4">
              {rightItems.map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/60" />
                  <span className="text-[14px] text-slate-400">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionDivider glow />
      <ArchitectureSection />
      <SectionDivider glow />
      <ProcessSection />
      <SectionDivider glow />
      <CapabilitiesSection />
      <SectionDivider glow />
      <WhyMidnightSection />
    </>
  );
}
