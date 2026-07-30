"use client";

import { FraudIndicator } from "@/lib/types";

interface FraudIndicatorCardProps {
  indicator: FraudIndicator;
}

const severityStyles = {
  low: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Low",
  },
  medium: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    label: "Medium",
  },
  high: {
    border: "border-red-200",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    label: "High",
  },
};

export default function FraudIndicatorCard({ indicator }: FraudIndicatorCardProps) {
  const style = severityStyles[indicator.severity];

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{indicator.icon}</span>
          <h4 className="font-semibold text-foreground text-sm">{indicator.title}</h4>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <p className="text-sm text-muted leading-relaxed">{indicator.description}</p>
    </div>
  );
}
