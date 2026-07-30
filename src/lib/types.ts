export interface HighlightedPhrase {
  text: string;
  severity: "safe" | "suspicious" | "danger";
}

export interface FraudIndicator {
  icon: string;
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: "safe" | "suspicious" | "high-risk";
  summary: string;
  highlights: HighlightedPhrase[];
  indicators: FraudIndicator[];
  verificationSteps: string[];
}

export interface MockOffer {
  id: string;
  title: string;
  preview: string;
  text: string;
  tag: "scam" | "suspicious" | "safe";
}
