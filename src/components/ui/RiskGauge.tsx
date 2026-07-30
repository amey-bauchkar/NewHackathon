"use client";

interface RiskGaugeProps {
  score: number;
  level: "safe" | "suspicious" | "high-risk";
}

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const colorMap = {
    safe: { stroke: "#10b981", bg: "text-emerald-600", label: "Safe" },
    suspicious: { stroke: "#f59e0b", bg: "text-amber-500", label: "Suspicious" },
    "high-risk": { stroke: "#ef4444", bg: "text-red-500", label: "High Risk" },
  };

  const c = colorMap[level];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={c.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${c.bg}`}>{score}</span>
          <span className="text-sm text-muted">/100</span>
        </div>
      </div>
      <span className={`mt-2 text-lg font-semibold ${c.bg}`}>{c.label}</span>
    </div>
  );
}
