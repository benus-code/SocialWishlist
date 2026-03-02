"use client";

interface ProgressBarProps {
  funded: number;
  total: number;
  size?: "sm" | "md";
}

export default function ProgressBar({ funded, total, size = "sm" }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((funded / total) * 100, 100) : 0;
  const h = size === "md" ? "h-3" : "h-2";

  return (
    <div className={`w-full bg-gray-100 rounded-full ${h} overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          pct >= 100
            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
            : pct > 50
            ? "bg-gradient-to-r from-amber-400 to-amber-500"
            : "bg-gradient-to-r from-violet-400 to-violet-500"
        }`}
        style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
      />
    </div>
  );
}
