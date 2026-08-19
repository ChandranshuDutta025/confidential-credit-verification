"use client";

import {
  CheckCircle2,
  X,
  BarChart3,
  Clock,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32 flex flex-col items-center">
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
            Dashboard
          </p>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
            Lender Dashboard
          </h1>
          <p className="text-[14px] text-slate-400">
            Monitor verification requests and review borrower eligibility.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[
            { label: "Eligible Applications", value: "1,247", change: "+12.5%", up: true, icon: CheckCircle2, color: "emerald" },
            { label: "Rejected", value: "89", change: "-3.2%", up: false, icon: X, color: "red" },
            { label: "Today's Requests", value: "56", change: "+8.1%", up: true, icon: BarChart3, color: "blue" },
            { label: "Avg. Processing Time", value: "2.3s", change: "-15%", up: true, icon: Clock, color: "violet" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-subtle rounded-2xl p-6 transition-all duration-200 hover:bg-white/[0.04]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] text-slate-400">{kpi.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  kpi.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                  kpi.color === "red" ? "bg-red-500/10 text-red-400" :
                  kpi.color === "blue" ? "bg-blue-500/10 text-blue-400" :
                  "bg-violet-500/10 text-violet-400"
                }`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-semibold text-white">{kpi.value}</div>
              <div className={`text-[12px] font-medium ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.change} from last month
              </div>
            </div>
          ))}
        </div>

        <div className="w-full glass rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
            <h2 className="text-[14px] font-medium text-white">Recent Applications</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-[13px] text-slate-300 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Application</th>
                  <th className="px-6 py-4">Score Range</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "APP-2847", range: "750-850", status: "Approved", date: "Jan 15, 2026" },
                  { id: "APP-2846", range: "700-749", status: "Approved", date: "Jan 15, 2026" },
                  { id: "APP-2845", range: "600-699", status: "Pending", date: "Jan 14, 2026" },
                  { id: "APP-2844", range: "300-599", status: "Rejected", date: "Jan 14, 2026" },
                  { id: "APP-2843", range: "750-850", status: "Approved", date: "Jan 13, 2026" },
                  { id: "APP-2842", range: "700-749", status: "Pending", date: "Jan 13, 2026" },
                ].map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-white">{row.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">{row.range}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        row.status === "Approved"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : row.status === "Pending"
                            ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">{row.date}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button className="text-[13px] font-medium text-blue-400 transition-colors hover:text-blue-300">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
            <span className="text-[12px] text-slate-500">Showing 1-6 of 1,336 applications</span>
            <div className="flex items-center gap-1">
              <button className="rounded px-3 py-1 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-white">Previous</button>
              <button className="rounded bg-blue-500/10 px-3 py-1 text-[12px] font-medium text-blue-400">1</button>
              <button className="rounded px-3 py-1 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-white">2</button>
              <button className="rounded px-3 py-1 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-white">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
