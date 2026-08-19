"use client";

import { FileCheck } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        <FileCheck className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-slate-900">Documentation</h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-500">
        Technical documentation for the Midnight Credit Verification protocol,
        Compact circuits, and developer integration guides.
      </p>
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-8 py-6 text-xs text-slate-400">
        Documentation portal coming soon.
      </div>
    </div>
  );
}
