"use client";

import { useState } from "react";

interface ComplaintDraftCardProps {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  amountRequested: string;
  complaintDraft: string;
}

export default function ComplaintDraftCard({
  companyName,
  contactEmail,
  contactPhone,
  amountRequested,
  complaintDraft,
}: ComplaintDraftCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = complaintDraft;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const entities = [
    { label: "Company", value: companyName },
    { label: "Email", value: contactEmail },
    { label: "Phone", value: contactPhone },
    { label: "Amount Requested", value: amountRequested },
  ];

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🚨</span>
        <h3 className="text-lg font-semibold text-foreground">
          Cybercrime Complaint Draft
        </h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
          Action Required
        </span>
      </div>

      {/* Extracted Entities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {entities.map((entity) => (
          <div key={entity.label} className="space-y-0.5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">
              {entity.label}
            </p>
            <p className="text-sm font-semibold text-foreground break-all">
              {entity.value}
            </p>
          </div>
        ))}
      </div>

      {/* Complaint Draft */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Draft Complaint (ready to paste):
        </label>
        <textarea
          readOnly
          value={complaintDraft}
          rows={5}
          className="w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-foreground leading-relaxed resize-none focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-red-700 text-white hover:bg-red-800"
          }`}
        >
          {copied ? "✓ Copied!" : "📋 Copy Complaint Draft"}
        </button>
      </div>

      {/* Cybercrime Portal Link */}
      <div className="rounded-lg border border-red-200 bg-white p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">🔗</span>
          <div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
            >
              File this complaint at cybercrime.gov.in
            </a>
            <p className="text-xs text-muted mt-0.5">
              National Cyber Crime Reporting Portal — Ministry of Home Affairs
            </p>
          </div>
        </div>

        {/* Evidence Checklist */}
        <div className="space-y-1.5 pl-7">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Keep these ready before filing:
          </p>
          {[
            "Screenshot of the message",
            "Payment request proof",
            "Sender's contact info",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
