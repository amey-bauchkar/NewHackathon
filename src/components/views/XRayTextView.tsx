"use client";

import { HighlightedPhrase } from "@/lib/types";

interface XRayTextViewProps {
  originalText: string;
  highlights: HighlightedPhrase[];
}

const severityColors = {
  danger: "bg-red-100 text-red-900 border-b-2 border-red-400",
  suspicious: "bg-amber-100 text-amber-900 border-b-2 border-amber-400",
  safe: "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-400",
};

export default function XRayTextView({ originalText, highlights }: XRayTextViewProps) {
  // Build highlighted version of the text
  const getHighlightedText = () => {
    if (!highlights || highlights.length === 0) {
      return <span>{originalText}</span>;
    }

    // Sort highlights by their position in the text (longest first to avoid partial matches)
    const sortedHighlights = [...highlights].sort(
      (a, b) => b.text.length - a.text.length
    );

    // Find all highlight positions
    const positions: {
      start: number;
      end: number;
      severity: "safe" | "suspicious" | "danger";
      text: string;
    }[] = [];

    for (const highlight of sortedHighlights) {
      const lowerOriginal = originalText.toLowerCase();
      const lowerSearch = highlight.text.toLowerCase();
      let startIndex = 0;

      while (startIndex < originalText.length) {
        const foundIndex = lowerOriginal.indexOf(lowerSearch, startIndex);
        if (foundIndex === -1) break;

        // Check if this position overlaps with existing positions
        const overlaps = positions.some(
          (p) => foundIndex < p.end && foundIndex + highlight.text.length > p.start
        );

        if (!overlaps) {
          positions.push({
            start: foundIndex,
            end: foundIndex + highlight.text.length,
            severity: highlight.severity,
            text: originalText.slice(foundIndex, foundIndex + highlight.text.length),
          });
        }
        startIndex = foundIndex + 1;
      }
    }

    // Sort positions by start index
    positions.sort((a, b) => a.start - b.start);

    // Build the highlighted output
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    positions.forEach((pos, idx) => {
      // Add text before this highlight
      if (pos.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {originalText.slice(lastIndex, pos.start)}
          </span>
        );
      }

      // Add highlighted text
      parts.push(
        <mark
          key={`highlight-${idx}`}
          className={`${severityColors[pos.severity]} rounded px-0.5 py-0.5 font-medium`}
          title={`${pos.severity.toUpperCase()} indicator`}
        >
          {pos.text}
        </mark>
      );

      lastIndex = pos.end;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
      parts.push(
        <span key="text-end">{originalText.slice(lastIndex)}</span>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">🔍 X-Ray Analysis</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-200 border border-red-400" />
            Danger
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
            Suspicious
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />
            Safe
          </span>
        </div>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
        {getHighlightedText()}
      </div>
    </div>
  );
}
