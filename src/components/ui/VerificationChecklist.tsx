"use client";

import { CheckCircle } from "lucide-react";

interface VerificationChecklistProps {
  steps: string[];
}

export default function VerificationChecklist({ steps }: VerificationChecklistProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-emerald-500" />
        Verification Steps
      </h3>
      <p className="text-sm text-muted mb-4">
        Follow these steps before sharing any documents or money:
      </p>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <span className="text-sm text-foreground leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
