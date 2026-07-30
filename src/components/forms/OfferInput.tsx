"use client";

import { Search, Loader2, RotateCcw } from "lucide-react";
import { useOfferStore } from "@/store/offerStore";

export default function OfferInput() {
  const { inputText, setInputText, analyzeOffer, isAnalyzing, result, reset } =
    useOfferStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim().length >= 20) {
      analyzeOffer(inputText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste the internship/job offer email or message here..."
          rows={8}
          className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
        />
        {inputText && (
          <span className="absolute bottom-3 right-3 text-xs text-muted">
            {inputText.length} characters
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isAnalyzing || inputText.trim().length < 20}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Analyze Offer
            </>
          )}
        </button>

        {result && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </form>
  );
}
