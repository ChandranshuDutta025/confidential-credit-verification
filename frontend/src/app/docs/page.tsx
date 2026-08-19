"use client";

import { FileCheck } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
          <FileCheck className="h-6 w-6 text-blue-400" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-white">Documentation</h1>
        <p className="mb-8 max-w-md text-[14px] leading-relaxed text-slate-400">
          Technical documentation for the Midnight Credit Verification protocol,
          Compact circuits, and developer integration guides.
        </p>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-8 py-6 text-[12px] text-slate-500">
          Documentation portal coming soon.
        </div>
      </div>
    </div>
  );
}
