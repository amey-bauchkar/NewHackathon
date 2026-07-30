/**
 * Domain Legitimacy Checker
 *
 * Standalone module that verifies whether a domain used in a job/internship
 * offer is legitimate or potentially fraudulent. Runs 6 independent checks:
 *   1. Free email provider detection
 *   2. Sender domain vs claimed domain match
 *   3. RDAP domain age lookup (free, no API key)
 *   4. MX record verification (Node dns module)
 *   5. Typosquat detection (Levenshtein distance vs known companies)
 *   6. Verdict computation with plain-English reasons
 *
 * This file is self-contained — it does NOT import from or modify any
 * existing project files (types.ts, offerStore.ts, etc.).
 *
 * INTEGRATION NOTES:
 * -  To display results in the UI, a teammate should create a component
 *    that calls the /api/domain-check POST endpoint and renders the
 *    DomainCheckResult. This can be added below the existing
 *    ResultsDashboard in src/components/views/ResultsDashboard.tsx,
 *    gated on result.riskLevel === "high-risk".
 * -  The AnalysisResult interface in src/lib/types.ts could optionally
 *    gain a `domainCheck?: DomainCheckResult` field, but do NOT add it
 *    without team sign-off.
 */

import dns from "dns";

// ─────────────────────────────────────────────────────────────────
// Public Interface
// ─────────────────────────────────────────────────────────────────

/**
 * Result returned by `checkDomainLegitimacy`.
 *
 * @field domain             - The domain that was checked (e.g. "globaltech-solutions.xyz").
 * @field claimedCompany     - The company name the sender claims to represent.
 * @field senderDomainMatch  - true if the sender email's domain matches `domain` exactly.
 * @field isFreeEmailProvider - true if sender uses gmail, yahoo, outlook, etc.
 * @field domainAgeDays      - Days since domain was registered. null if lookup failed.
 * @field domainCreatedDate  - ISO date string of domain creation. null if lookup failed.
 * @field isTyposquat        - true if `domain` is suspiciously similar to a known company domain.
 * @field typosquatTarget    - The real domain being impersonated, or null.
 * @field hasMxRecords       - true if the domain has valid MX (mail server) records.
 * @field verdict            - Final assessment: 'legit' | 'suspicious' | 'likely-fake'.
 * @field reasons            - Array of plain-English explanations for every flagged issue.
 */
export interface DomainCheckResult {
  domain: string;
  claimedCompany: string;
  senderDomainMatch: boolean;
  isFreeEmailProvider: boolean;
  domainAgeDays: number | null;
  domainCreatedDate: string | null;
  isTyposquat: boolean;
  typosquatTarget: string | null;
  hasMxRecords: boolean;
  verdict: "legit" | "suspicious" | "likely-fake";
  reasons: string[];
}

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

/** Free email providers commonly used in India */
const FREE_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "rediffmail.com",
  "protonmail.com",
  "yahoo.co.in",
  "yahoo.in",
  "live.com",
  "aol.com",
]);

/**
 * Well-known companies relevant to Indian campus placements,
 * mapped to their real primary domain.
 */
const KNOWN_COMPANY_DOMAINS: { company: string; domain: string }[] = [
  { company: "Infosys", domain: "infosys.com" },
  { company: "TCS", domain: "tcs.com" },
  { company: "Wipro", domain: "wipro.com" },
  { company: "Accenture", domain: "accenture.com" },
  { company: "Cognizant", domain: "cognizant.com" },
  { company: "Capgemini", domain: "capgemini.com" },
  { company: "HCL", domain: "hcltech.com" },
  { company: "Tech Mahindra", domain: "techmahindra.com" },
  { company: "IBM", domain: "ibm.com" },
  { company: "Google", domain: "google.com" },
  { company: "Microsoft", domain: "microsoft.com" },
  { company: "Amazon", domain: "amazon.com" },
  { company: "Deloitte", domain: "deloitte.com" },
  { company: "EY", domain: "ey.com" },
  { company: "KPMG", domain: "kpmg.com" },
];

// ─────────────────────────────────────────────────────────────────
// Levenshtein Distance (local implementation — no npm dependency)
// ─────────────────────────────────────────────────────────────────

/**
 * Compute the Levenshtein edit-distance between two strings.
 * Uses the classic dynamic-programming approach.
 */
function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  const dp: number[][] = Array.from({ length: la + 1 }, () =>
    Array(lb + 1).fill(0)
  );

  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[la][lb];
}

// ─────────────────────────────────────────────────────────────────
// Individual Checks
// ─────────────────────────────────────────────────────────────────

/** Extract the domain portion from an email address. */
function extractEmailDomain(email: string): string {
  const parts = email.split("@");
  return (parts[1] || "").toLowerCase().trim();
}

/** Check 1 & 2: Free email provider + sender domain match */
function checkEmailBasics(
  domain: string,
  senderEmail: string
): { isFreeEmailProvider: boolean; senderDomainMatch: boolean; senderDomain: string } {
  const senderDomain = extractEmailDomain(senderEmail);
  return {
    isFreeEmailProvider: FREE_EMAIL_PROVIDERS.has(senderDomain),
    senderDomainMatch: senderDomain === domain.toLowerCase().trim(),
    senderDomain,
  };
}

/**
 * Check 3: RDAP domain age lookup.
 * Uses the free RDAP protocol — no API key required.
 * Returns { domainAgeDays, domainCreatedDate } or nulls on failure.
 */
async function checkDomainAge(
  domain: string
): Promise<{ domainAgeDays: number | null; domainCreatedDate: string | null; error?: string }> {
  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      return {
        domainAgeDays: null,
        domainCreatedDate: null,
        error: `RDAP returned status ${response.status}`,
      };
    }

    const data = await response.json();
    const events = data.events as
      | { eventAction: string; eventDate: string }[]
      | undefined;

    if (!Array.isArray(events)) {
      return {
        domainAgeDays: null,
        domainCreatedDate: null,
        error: "No events array in RDAP response",
      };
    }

    const registrationEvent = events.find(
      (e) => e.eventAction === "registration"
    );

    if (!registrationEvent?.eventDate) {
      return {
        domainAgeDays: null,
        domainCreatedDate: null,
        error: "No registration event found in RDAP data",
      };
    }

    const createdDate = new Date(registrationEvent.eventDate);
    const now = new Date();
    const ageDays = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      domainAgeDays: ageDays,
      domainCreatedDate: createdDate.toISOString().split("T")[0],
    };
  } catch (err) {
    return {
      domainAgeDays: null,
      domainCreatedDate: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Check 4: MX record verification using Node's built-in dns module.
 * Returns true if at least one MX record exists for the domain.
 */
async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    // ENOTFOUND, ENODATA, etc. — domain has no MX records
    return false;
  }
}

/**
 * Check 5: Typosquat detection.
 * Compares the domain against well-known company domains using
 * Levenshtein distance. Flags if distance is 1–3 but NOT exact match.
 */
function checkTyposquat(
  domain: string
): { isTyposquat: boolean; typosquatTarget: string | null; matchedCompany: string | null } {
  const domainLower = domain.toLowerCase().trim();

  for (const entry of KNOWN_COMPANY_DOMAINS) {
    const realDomain = entry.domain.toLowerCase();

    // Skip exact matches — exact match means it IS the real domain
    if (domainLower === realDomain) {
      return { isTyposquat: false, typosquatTarget: null, matchedCompany: null };
    }

    const distance = levenshtein(domainLower, realDomain);

    if (distance >= 1 && distance <= 3) {
      return {
        isTyposquat: true,
        typosquatTarget: entry.domain,
        matchedCompany: entry.company,
      };
    }
  }

  return { isTyposquat: false, typosquatTarget: null, matchedCompany: null };
}

// ─────────────────────────────────────────────────────────────────
// Verdict & Reasons
// ─────────────────────────────────────────────────────────────────

/**
 * Check 6: Compute final verdict and build reasons array.
 */
function computeVerdict(params: {
  isFreeEmailProvider: boolean;
  senderDomainMatch: boolean;
  senderDomain: string;
  domainAgeDays: number | null;
  domainCreatedDate: string | null;
  domainAgeError?: string;
  isTyposquat: boolean;
  typosquatTarget: string | null;
  matchedCompany: string | null;
  hasMxRecords: boolean;
  domain: string;
  claimedCompany: string;
}): { verdict: "legit" | "suspicious" | "likely-fake"; reasons: string[] } {
  const reasons: string[] = [];
  let isLikelyFake = false;
  let isSuspicious = false;

  // ── Typosquat ──
  if (params.isTyposquat) {
    isLikelyFake = true;
    reasons.push(
      `The domain "${params.domain}" looks very similar to the real "${params.typosquatTarget}" (used by ${params.matchedCompany}). This is a common trick called "typosquatting" where scammers register domains that look almost identical to real companies.`
    );
  }

  // ── Free email + domain mismatch ──
  if (params.isFreeEmailProvider && !params.senderDomainMatch) {
    isLikelyFake = true;
    reasons.push(
      `The sender is using a free email provider (${params.senderDomain}) instead of a company email address. Legitimate companies like "${params.claimedCompany}" always send offer letters from their official domain, not from Gmail or Yahoo.`
    );
  } else if (params.isFreeEmailProvider && params.senderDomainMatch) {
    // Edge case: claimed domain IS a free provider (very odd for a company)
    isSuspicious = true;
    reasons.push(
      `The sender email uses a free email provider (${params.senderDomain}). Real companies send official communications from their own corporate email domain.`
    );
  }

  // ── Domain age ──
  if (params.domainAgeDays !== null) {
    if (params.domainAgeDays < 30) {
      isLikelyFake = true;
      reasons.push(
        `This domain was registered only ${params.domainAgeDays} day${params.domainAgeDays === 1 ? "" : "s"} ago (on ${params.domainCreatedDate}). Established companies have domains that are years old. A brand-new domain is a major red flag.`
      );
    } else if (params.domainAgeDays < 180) {
      isSuspicious = true;
      reasons.push(
        `This domain was registered ${params.domainAgeDays} days ago (on ${params.domainCreatedDate}), which is relatively recent. Most legitimate companies have domains that are several years old.`
      );
    } else {
      reasons.push(
        `The domain has been registered for ${params.domainAgeDays} days (since ${params.domainCreatedDate}), which is a reasonable age for a legitimate company.`
      );
    }
  } else {
    isSuspicious = true;
    reasons.push(
      params.domainAgeError
        ? `Domain could not be verified via RDAP — may not exist or lookup failed (${params.domainAgeError}). Be cautious when a domain's registration cannot be confirmed.`
        : `Domain could not be verified via RDAP — may not exist or lookup failed. Be cautious when a domain's registration cannot be confirmed.`
    );
  }

  // ── MX records ──
  if (!params.hasMxRecords) {
    isSuspicious = true;
    reasons.push(
      `No mail servers (MX records) are configured for "${params.domain}". This means the domain cannot actually send or receive emails, which is very unusual for a company that supposedly contacts candidates by email.`
    );
  }

  // ── Sender domain mismatch (non-free) ──
  if (!params.senderDomainMatch && !params.isFreeEmailProvider) {
    isSuspicious = true;
    reasons.push(
      `The sender's email domain (${params.senderDomain}) does not match the claimed company domain (${params.domain}). Legitimate offers come from the company's own email domain.`
    );
  }

  // ── Determine verdict ──
  let verdict: "legit" | "suspicious" | "likely-fake";
  if (isLikelyFake) {
    verdict = "likely-fake";
  } else if (isSuspicious) {
    verdict = "suspicious";
  } else {
    verdict = "legit";
  }

  // If legit and no reasons beyond the positive age one, add a reassuring note
  if (verdict === "legit" && reasons.length <= 1) {
    reasons.push(
      `The domain appears to be legitimately configured with proper mail servers. The sender's email matches the claimed domain.`
    );
  }

  return { verdict, reasons };
}

// ─────────────────────────────────────────────────────────────────
// Main Exported Function
// ─────────────────────────────────────────────────────────────────

/**
 * Checks the legitimacy of a domain used in a job/internship offer.
 *
 * Runs 6 independent checks (free email, domain match, RDAP age,
 * MX records, typosquat detection) and returns a comprehensive result
 * with a final verdict and plain-English reasons.
 *
 * **Never throws** — all errors are caught internally and result in
 * conservative "suspicious" verdicts with explanatory reasons.
 *
 * @param params.domain         - The domain to verify (e.g. "globaltech-solutions.xyz")
 * @param params.claimedCompany - The company name from the offer (e.g. "GlobalTech Solutions")
 * @param params.senderEmail    - The full sender email address (e.g. "hr@globaltech-solutions.xyz")
 *
 * @returns A DomainCheckResult with all check findings and final verdict.
 */
export async function checkDomainLegitimacy(params: {
  domain: string;
  claimedCompany: string;
  senderEmail: string;
}): Promise<DomainCheckResult> {
  const { domain, claimedCompany, senderEmail } = params;

  try {
    // ── Known company whitelist — skip unreliable checks for verified domains ──
    const knownDomain = KNOWN_COMPANY_DOMAINS.find(
      (entry) => entry.domain.toLowerCase() === domain.toLowerCase().trim()
    );
    if (knownDomain) {
      const emailBasics = checkEmailBasics(domain, senderEmail);
      return {
        domain,
        claimedCompany,
        senderDomainMatch: emailBasics.senderDomainMatch,
        isFreeEmailProvider: emailBasics.isFreeEmailProvider,
        domainAgeDays: null,
        domainCreatedDate: null,
        isTyposquat: false,
        typosquatTarget: null,
        hasMxRecords: true,
        verdict: "legit",
        reasons: [
          `"${domain}" is the verified official domain of ${knownDomain.company}. This is a well-known, established company.`,
          ...(emailBasics.senderDomainMatch
            ? [`The sender's email matches the official ${knownDomain.company} domain — this is a good sign.`]
            : [`Note: The sender's email (${emailBasics.senderDomain}) does not match ${domain}. Verify that the email is from an official ${knownDomain.company} address.`]),
        ],
      };
    }

    // Run all checks — independent, so we can parallelize the async ones
    const emailBasics = checkEmailBasics(domain, senderEmail);
    const typosquatResult = checkTyposquat(domain);

    // RDAP and DNS are I/O — run in parallel
    const [ageResult, hasMxRecords] = await Promise.all([
      checkDomainAge(domain),
      checkMxRecords(domain),
    ]);

    // Compute verdict
    const { verdict, reasons } = computeVerdict({
      isFreeEmailProvider: emailBasics.isFreeEmailProvider,
      senderDomainMatch: emailBasics.senderDomainMatch,
      senderDomain: emailBasics.senderDomain,
      domainAgeDays: ageResult.domainAgeDays,
      domainCreatedDate: ageResult.domainCreatedDate,
      domainAgeError: ageResult.error,
      isTyposquat: typosquatResult.isTyposquat,
      typosquatTarget: typosquatResult.typosquatTarget,
      matchedCompany: typosquatResult.matchedCompany,
      hasMxRecords,
      domain,
      claimedCompany,
    });

    return {
      domain,
      claimedCompany,
      senderDomainMatch: emailBasics.senderDomainMatch,
      isFreeEmailProvider: emailBasics.isFreeEmailProvider,
      domainAgeDays: ageResult.domainAgeDays,
      domainCreatedDate: ageResult.domainCreatedDate,
      isTyposquat: typosquatResult.isTyposquat,
      typosquatTarget: typosquatResult.typosquatTarget,
      hasMxRecords,
      verdict,
      reasons,
    };
  } catch (err) {
    // Catastrophic fallback — should never reach here, but just in case
    console.error("checkDomainLegitimacy fatal error:", err);
    return {
      domain,
      claimedCompany,
      senderDomainMatch: false,
      isFreeEmailProvider: false,
      domainAgeDays: null,
      domainCreatedDate: null,
      isTyposquat: false,
      typosquatTarget: null,
      hasMxRecords: false,
      verdict: "suspicious",
      reasons: [
        "Domain verification could not be completed due to an internal error. Treat this offer with caution and verify the company through official channels.",
      ],
    };
  }
}
