"use client";

import { placementCellContact } from "@/lib/placementCellConfig";

export default function PlacementCellBar() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 border-l-4 border-l-slate-400">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
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
