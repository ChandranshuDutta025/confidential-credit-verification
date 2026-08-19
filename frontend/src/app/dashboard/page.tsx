"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  X,
  BarChart3,
  Clock,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TableRowSkeleton } from "@/components/Skeleton";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const MOCK_APPLICATIONS = [
  { id: "APP-2847", range: "750-850", status: "Approved", date: "2026-01-15" },
  { id: "APP-2846", range: "700-749", status: "Approved", date: "2026-01-15" },
  { id: "APP-2845", range: "600-699", status: "Pending", date: "2026-01-14" },
  { id: "APP-2844", range: "300-599", status: "Rejected", date: "2026-01-14" },
  { id: "APP-2843", range: "750-850", status: "Approved", date: "2026-01-13" },
  { id: "APP-2842", range: "700-749", status: "Pending", date: "2026-01-13" },
  { id: "APP-2841", range: "750-850", status: "Approved", date: "2026-01-12" },
  { id: "APP-2840", range: "300-599", status: "Rejected", date: "2026-01-12" },
  { id: "APP-2839", range: "600-699", status: "Pending", date: "2026-01-11" },
  { id: "APP-2838", range: "750-850", status: "Approved", date: "2026-01-11" },
  { id: "APP-2837", range: "700-749", status: "Approved", date: "2026-01-10" },
  { id: "APP-2836", range: "300-599", status: "Rejected", date: "2026-01-10" },
];

function generate30DayData() {
  const data = [];
  const now = new Date("2026-01-15");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    data.push({
      name: `${month} ${day}`,
      approved: Math.floor(Math.random() * 30) + 15,
      pending: Math.floor(Math.random() * 15) + 5,
      rejected: Math.floor(Math.random() * 10) + 2,
    });
  }
  return data;
}

const CHART_DATA = generate30DayData();

const SPARKLINE_DATA = {
  eligible: [8, 12, 10, 14, 11, 15, 13],
  rejected: [5, 4, 6, 3, 5, 4, 3],
  today: [3, 5, 4, 6, 7, 5, 8],
  avg: [2.8, 2.6, 2.5, 2.4, 2.5, 2.3, 2.3],
};

type SortKey = "id" | "range" | "status" | "date";
type SortDir = "asc" | "desc";
type StatusFilter = "All" | "Approved" | "Pending" | "Rejected";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function CountUp({
  target,
  suffix = "",
  decimals = 0,
  duration = 1200,
  reduced,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  reduced: boolean;
}) {
  const [val, setVal] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setVal(target);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration, reduced]);

  return (
    <span>
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

function MiniSparkline({
  data,
  color,
  reduced,
}: {
  data: number[];
  color: string;
  reduced: boolean;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={!reduced}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function statusColor(status: string) {
  if (status === "Approved")
    return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  if (status === "Pending")
    return "border border-amber-500/20 bg-amber-500/10 text-amber-400";
  return "border border-red-500/20 bg-red-500/10 text-red-400";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MOCK_TIMELINE = [
  { time: "2:30 PM", label: "Application submitted" },
  { time: "2:31 PM", label: "Identity verified" },
  { time: "2:32 PM", label: "Credit check initiated" },
  { time: "2:33 PM", label: "Score computed" },
  { time: "2:34 PM", label: "Decision rendered" },
];

export default function DashboardPage() {
  const reduced = useReducedMotion();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;
  const [drawerApp, setDrawerApp] = useState<
    (typeof MOCK_APPLICATIONS)[number] | null
  >(null);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const filtered = useMemo(() => {
    let rows = [...MOCK_APPLICATIONS];
    if (statusFilter !== "All") {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter((r) => r.id.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") cmp = a.id.localeCompare(b.id);
      else if (sortKey === "range") cmp = a.range.localeCompare(b.range);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = a.date.localeCompare(b.date);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [debouncedSearch, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (!drawerApp) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerApp(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerApp]);

  function SortHeader({
    label,
    field,
  }: {
    label: string;
    field: SortKey;
  }) {
    const active = sortKey === field;
    return (
      <th
        className="cursor-pointer select-none px-6 py-4 hover:text-slate-400"
        onClick={() => toggleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active ? (
            sortDir === "asc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <span className="h-3 w-3" />
          )}
        </span>
      </th>
    );
  }

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

        {/* Stat Cards */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[
            {
              label: "Eligible Applications",
              target: 1247,
              decimals: 0,
              suffix: "",
              change: "+12.5%",
              up: true,
              icon: CheckCircle2,
              color: "emerald",
              sparkColor: "#34d399",
              sparkData: SPARKLINE_DATA.eligible,
            },
            {
              label: "Rejected",
              target: 89,
              decimals: 0,
              suffix: "",
              change: "-3.2%",
              up: false,
              icon: X,
              color: "red",
              sparkColor: "#f87171",
              sparkData: SPARKLINE_DATA.rejected,
            },
            {
              label: "Today's Requests",
              target: 56,
              decimals: 0,
              suffix: "",
              change: "+8.1%",
              up: true,
              icon: BarChart3,
              color: "blue",
              sparkColor: "#60a5fa",
              sparkData: SPARKLINE_DATA.today,
            },
            {
              label: "Avg. Processing Time",
              target: 2.3,
              decimals: 1,
              suffix: "s",
              change: "-15%",
              up: true,
              icon: Clock,
              color: "violet",
              sparkColor: "#a78bfa",
              sparkData: SPARKLINE_DATA.avg,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="glass-subtle rounded-2xl p-6 transition-all duration-200 hover:bg-white/[0.04] border border-white/[0.06]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] text-slate-400">{kpi.label}</span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    kpi.color === "emerald"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : kpi.color === "red"
                        ? "bg-red-500/10 text-red-400"
                        : kpi.color === "blue"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-violet-500/10 text-violet-400"
                  }`}
                >
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mb-1 text-2xl font-semibold text-white">
                <CountUp
                  target={kpi.target}
                  suffix={kpi.suffix}
                  decimals={kpi.decimals}
                  reduced={reduced}
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-0.5 text-[12px] font-medium ${
                    kpi.up ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {kpi.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {kpi.change}
                </span>
                <MiniSparkline
                  data={kpi.sparkData}
                  color={kpi.sparkColor}
                  reduced={reduced}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Area Chart */}
        <div className="w-full glass-subtle rounded-2xl p-6 mb-10 border border-white/[0.06]">
          <h2 className="mb-4 text-[14px] font-medium text-white">
            Applications Over Time
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke="#34d399"
                  fill="url(#gradApproved)"
                  strokeWidth={2}
                  isAnimationActive={!reduced}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#fbbf24"
                  fill="url(#gradPending)"
                  strokeWidth={2}
                  isAnimationActive={!reduced}
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  name="Rejected"
                  stroke="#f87171"
                  fill="url(#gradRejected)"
                  strokeWidth={2}
                  isAnimationActive={!reduced}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="w-full glass rounded-2xl border border-white/[0.06]">
          <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[14px] font-medium text-white">
              Recent Applications
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-[13px] text-slate-300 outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["All", "Approved", "Pending", "Rejected"] as StatusFilter[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                        statusFilter === s
                          ? s === "Approved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : s === "Pending"
                              ? "bg-amber-500/15 text-amber-400"
                              : s === "Rejected"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-blue-500/15 text-blue-400"
                          : "bg-white/[0.03] text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <SortHeader label="Application" field="id" />
                  <SortHeader label="Score Range" field="range" />
                  <SortHeader label="Status" field="status" />
                  <SortHeader label="Date" field="date" />
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))
                  : paged.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                          {row.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                          {row.range}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColor(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                          {formatDate(row.date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            onClick={() => setDrawerApp(row)}
                            className="text-[13px] font-medium text-blue-400 transition-colors hover:text-blue-300"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
            <span className="text-[12px] text-slate-500">
              Showing {(safePage - 1) * PER_PAGE + 1}-
              {Math.min(safePage * PER_PAGE, filtered.length)} of{" "}
              {filtered.length} applications
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded px-3 py-1 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`rounded px-3 py-1 text-[12px] font-medium ${
                    safePage === i + 1
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded px-3 py-1 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerApp(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: reduced ? "tween" : "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/[0.06] bg-slate-950/95 backdrop-blur-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                  <h3 className="text-[15px] font-semibold text-white">
                    Application Details
                  </h3>
                  <button
                    onClick={() => setDrawerApp(null)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-slate-400">
                          Application ID
                        </span>
                        <span className="text-[13px] font-medium text-white">
                          {drawerApp.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-slate-400">
                          Score Range
                        </span>
                        <span className="text-[13px] font-medium text-white">
                          {drawerApp.range}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-slate-400">
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColor(drawerApp.status)}`}
                        >
                          {drawerApp.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-slate-400">
                          Date
                        </span>
                        <span className="text-[13px] font-medium text-white">
                          {formatDate(drawerApp.date)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-4 text-[13px] font-medium text-white">
                        Status History
                      </h4>
                      <div className="relative ml-3 border-l border-white/10 pl-6">
                        {MOCK_TIMELINE.map((item, i) => (
                          <div key={i} className="relative mb-6 last:mb-0">
                            <div className="absolute -left-[31px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-slate-950" />
                            <p className="text-[12px] font-medium text-slate-300">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {item.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
