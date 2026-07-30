"use client";

import { placementCellContact } from "@/lib/placementCellConfig";

/**
 * A compact horizontal bar showing the student's own college placement
 * cell contact details. Renders at the bottom of every analysis result
 * (safe, suspicious, and high-risk) so students always know who to
 * reach out to for help verifying an offer.
 *
 * Uses the app's neutral/informational color tokens (border-border,
 * bg-card, text-foreground, text-muted) — intentionally calm and
 * institutional, NOT red/alarming.
 */
export default function PlacementCellBar() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏫</span>
        <h4 className="text-sm font-semibold text-foreground">
          Your Placement Cell
        </h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Name */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Contact Person
          </p>
          <p className="text-sm font-semibold text-foreground">
            {placementCellContact.name}
          </p>
        </div>

        {/* Email — mailto link */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Email
          </p>
          <a
            href={`mailto:${placementCellContact.email}`}
            className="text-sm font-semibold text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            {placementCellContact.email}
          </a>
        </div>

        {/* Office Timings — plain text */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Office Timings
          </p>
          <p className="text-sm font-semibold text-foreground">
            {placementCellContact.officeTimings}
          </p>
        </div>

        {/* Telephone Extension — plain text, NOT a tel: link */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Telephone
          </p>
          <p className="text-sm font-semibold text-foreground">
            Ext: {placementCellContact.telephoneExtension}
          </p>
        </div>
      </div>
    </div>
  );
}
