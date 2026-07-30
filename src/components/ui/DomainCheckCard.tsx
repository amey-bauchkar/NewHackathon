"use client";

import { useState, useEffect } from "react";
import type { DomainCheckResult } from "@/lib/domainCheck";

/**
 * Extracts the first email address found in the text.
 */
function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

/**
 * Extracts domain from an email address.
 */
function extractDomainFromEmail(email: string): string {
  return email.split("@")[1] || "";
}

/**
 * Tries to extract a company name from text — looks for patterns like
 * "at CompanyName", "from CompanyName", or "CompanyName Pvt. Ltd."
 */
function extractCompanyName(text: string): string {
  // Try "at/from CompanyName (Pvt. Ltd. / Inc / etc.)"
  const patterns = [
    /(?:at|from|by)\s+([A-Z][A-Za-z0-9\s&.]+(?:Pvt\.?\s*Ltd\.?|Inc\.?|LLC|Limited|Solutions|Technologies|Services|Corp\.?))/i,
    /(?:at|from|by)\s+([A-Z][A-Za-z\s]{2,30})/,
    /Company:\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "Unknown Company";
}

interface DomainCheckCardProps {
  originalText: string;
}

const verdictConfig = {
  legit: {
    icon: "✅",
    label: "Legit",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    barColor: "bg-emerald-500",
  },
  suspicious: {
    icon: "⚠️",
    label: "Suspicious",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    barColor: "bg-amber-500",
  },
  "likely-fake": {
    icon: "🚨",
    label: "Likely Fake",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    barColor: "bg-red-500",
  },
};

export default function DomainCheckCard({ originalText }: DomainCheckCardProps) {
  const [result, setResult] = useState<DomainCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noEmail, setNoEmail] = useState(false);

  useEffect(() => {
    const email = extractEmail(originalText);
    if (!email) {
      setNoEmail(true);
      return;
    }

    const domain = extractDomainFromEmail(email);
    const company = extractCompanyName(originalText);

    setLoading(true);
    setError(null);

    fetch("/api/domain-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain,
        claimedCompany: company,
        senderEmail: email,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Domain check failed");
        }
        return res.json();
      })
      .then((data: DomainCheckResult) => {
        setResult(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Domain check failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [originalText]);

  // No email found in the text — don't render anything
  if (noEmail) return null;

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted">Checking domain legitimacy…</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-foreground">
            Domain check unavailable: {error}
          </p>
        </div>
      </div>
    );
  }

  // No result yet
  if (!result) return null;

  const config = verdictConfig[result.verdict];

  // Checks to display
  const checks = [
    {
      label: "Sender Domain Match",
      passed: result.senderDomainMatch,
      detail: result.senderDomainMatch
        ? "Sender email matches the claimed domain"
        : "Sender email does NOT match the claimed domain",
    },
    {
      label: "Free Email Provider",
      passed: !result.isFreeEmailProvider,
      detail: result.isFreeEmailProvider
        ? "Sent from a free email provider (Gmail, Yahoo, etc.)"
        : "Uses a corporate email domain",
    },
    {
      label: "Domain Age",
      passed: result.domainAgeDays !== null && result.domainAgeDays >= 180,
      detail:
        result.domainAgeDays !== null
          ? `Registered ${result.domainAgeDays} days ago (${result.domainCreatedDate})`
          : "Could not verify domain registration",
    },
    {
      label: "Mail Servers (MX)",
      passed: result.hasMxRecords,
      detail: result.hasMxRecords
        ? "Valid mail servers configured"
        : "No mail servers found — domain may not handle email",
    },
    {
      label: "Typosquat Check",
      passed: !result.isTyposquat,
      detail: result.isTyposquat
        ? `Looks similar to ${result.typosquatTarget} — possible impersonation`
        : "No known company impersonation detected",
    },
  ];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6 space-y-5`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <h3 className="text-lg font-semibold text-foreground">
            Domain Legitimacy Check
          </h3>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.badge}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {/* Domain info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Domain</p>
          <p className="text-sm font-semibold text-foreground">{result.domain}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Claimed Company</p>
          <p className="text-sm font-semibold text-foreground">{result.claimedCompany}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Domain Age</p>
          <p className="text-sm font-semibold text-foreground">
            {result.domainAgeDays !== null ? `${result.domainAgeDays} days` : "Unknown"}
          </p>
        </div>
      </div>

      {/* 5 Checks */}
      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-sm">
              {check.passed ? "✅" : "❌"}
            </span>
            <div>
              <span className="text-sm font-semibold text-foreground">{check.label}: </span>
              <span className="text-sm text-muted">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reasons */}
      {result.reasons.length > 0 && (
        <div className="rounded-lg border border-inherit bg-white/60 p-4 space-y-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Analysis Details</p>
          {result.reasons.map((reason, i) => (
            <p key={i} className="text-sm text-foreground leading-relaxed">
              {reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
