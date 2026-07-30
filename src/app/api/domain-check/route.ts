/**
 * Domain Check API Route
 *
 * POST /api/domain-check
 *
 * Accepts { domain, claimedCompany, senderEmail } and returns a
 * DomainCheckResult with verdict and detailed reasons.
 *
 * This route is self-contained — it only imports from the new
 * src/lib/domainCheck.ts and does not modify any existing routes.
 *
 * INTEGRATION NOTES:
 * -  The frontend can call this endpoint from a new "Domain Check"
 *    button or automatically after an offer is analyzed as high-risk.
 * -  The call should be made from the client side (e.g. from a new
 *    component or from the offerStore) — do NOT auto-wire this into
 *    the existing analyzeOffer flow without team sign-off.
 */

import { NextResponse } from "next/server";
import { checkDomainLegitimacy } from "@/lib/domainCheck";

export async function POST(request: Request) {
  try {
    // ── Parse body ──
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { domain, claimedCompany, senderEmail } = body as {
      domain?: string;
      claimedCompany?: string;
      senderEmail?: string;
    };

    // ── Validate ──
    if (!domain || typeof domain !== "string" || domain.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'domain' field. Provide the domain to check (e.g. 'globaltech-solutions.xyz')." },
        { status: 400 }
      );
    }

    if (!claimedCompany || typeof claimedCompany !== "string" || claimedCompany.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'claimedCompany' field. Provide the company name from the offer." },
        { status: 400 }
      );
    }

    if (!senderEmail || typeof senderEmail !== "string" || senderEmail.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty 'senderEmail' field. Provide the sender's full email address." },
        { status: 400 }
      );
    }

    // Basic email format sanity check
    if (!senderEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid 'senderEmail' — must contain an '@' symbol." },
        { status: 400 }
      );
    }

    // ── Run check ──
    const result = await checkDomainLegitimacy({
      domain: domain.trim(),
      claimedCompany: claimedCompany.trim(),
      senderEmail: senderEmail.trim(),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("domain-check route error:", err);
    return NextResponse.json(
      { error: "Internal server error during domain check. Please try again." },
      { status: 500 }
    );
  }
}
