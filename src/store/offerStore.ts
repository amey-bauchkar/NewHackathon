import { create } from "zustand";
import { AnalysisResult } from "@/lib/types";

interface OfferStore {
  inputText: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  setInputText: (text: string) => void;
  analyzeOffer: (text: string) => Promise<void>;
  reset: () => void;
}

export const useOfferStore = create<OfferStore>((set) => ({
  inputText: "",
  isAnalyzing: false,
  result: null,
  error: null,

  setInputText: (text: string) => set({ inputText: text }),

  analyzeOffer: async (text: string) => {
    set({ isAnalyzing: true, result: null, error: null });
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result: AnalysisResult = await response.json();
      set({ result, isAnalyzing: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Something went wrong",
        isAnalyzing: false,
      });
    }
  },

  reset: () => set({ inputText: "", result: null, error: null, isAnalyzing: false }),
}));
