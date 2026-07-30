"use client";

interface BadgeProps {
  level: "safe" | "suspicious" | "high-risk";
}

const config = {
  safe: {
    label: "Safe",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  suspicious: {
    label: "Suspicious",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  "high-risk": {
    label: "High Risk",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export default function Badge({ level }: BadgeProps) {
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  );
}
