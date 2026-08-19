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
                <th className="px-4 sm:px-6 lg:px-8 py-4 text-right">
                  Actions
                </th>
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
  );
}
