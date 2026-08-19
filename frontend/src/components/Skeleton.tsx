"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-[shimmer_2s_linear_infinite] rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] bg-[length:200%_100%] ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-subtle rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="mb-2 h-8 w-20" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.03]">
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
    </tr>
  );
}
