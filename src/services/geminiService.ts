"use server";

import { AnalysisResult } from "@/lib/types";

const ANALYSIS_PROMPT = `You are an expert cybersecurity analyst specializing in detecting fake internship and job offer scams targeting students in India.

Analyze the following offer text and return a JSON response with this EXACT structure:

{
  "riskScore": <number 0-100, where 0 is completely safe and 100 is definitely a scam>,
  "riskLevel": "<one of: safe, suspicious, high-risk>",
  "summary": "<one clear sentence verdict for a student>",
  "highlights": [
    {"text": "<exact phrase from the offer that is a red flag or trust signal>", "severity": "<one of: danger, suspicious, safe>"}
  ],
  "indicators": [
    {"icon": "<single emoji>", "title": "<short title like 'Payment Request'>", "severity": "<one of: low, medium, high>", "description": "<1-2 sentence explanation in simple language>"}
  ],
  "verificationSteps": [
    "<actionable step the student should take, e.g., 'Search the company name on LinkedIn and verify employee count'>"
  ]
}

IMPORTANT RULES:
- The "highlights" array must contain EXACT phrases copied from the original text. Do not paraphrase.
- Include 3-8 highlights covering both red flags and any trust signals.
- Include 3-6 fraud indicators covering: payment requests, urgency/pressure, vague company info, unrealistic salary, suspicious contact info, missing interview process.
- Include 3-5 practical verification steps a college student can take.
- riskLevel must be "safe" if riskScore <= 30, "suspicious" if 31-60, "high-risk" if > 60.
- Write all descriptions in simple, student-friendly English.
- Return ONLY valid JSON, no other text.

Here is the offer text to analyze:
`;

export async function analyzeOffer(text: string): Promise<AnalysisResult> {
  // Try Groq first (faster, higher limits), then Gemini as fallback
  const providers = [
    { name: "Groq", fn: () => callGroq(text) },
    { name: "Gemini", fn: () => callGemini(text) },
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);
      const raw = await provider.fn();
      const result = sanitizeResult(raw);

      console.log(`${provider.name} succeeded! Risk: ${result.riskScore}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`${provider.name} failed:`, lastError.message);
    }
  }

  throw new Error("All AI providers failed. Please try again in a minute.");
}

// ── Sanitize AI Response (NEVER crash) ──────────────────────────
function sanitizeResult(raw: Record<string, unknown>): AnalysisResult {
  const riskScore = typeof raw.riskScore === "number" ? Math.min(100, Math.max(0, raw.riskScore)) : 50;

  let riskLevel: "safe" | "suspicious" | "high-risk";
  if (riskScore <= 30) riskLevel = "safe";
  else if (riskScore <= 60) riskLevel = "suspicious";
  else riskLevel = "high-risk";

  return {
    riskScore,
    riskLevel,
    summary: typeof raw.summary === "string" ? raw.summary : "Analysis complete. Review the details below.",
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights.map((h: Record<string, unknown>) => ({
          text: String(h.text || ""),
          severity: (["safe", "suspicious", "danger"].includes(String(h.severity)) ? h.severity : "suspicious") as "safe" | "suspicious" | "danger",
        })).filter((h) => h.text.length > 0)
      : [],
    indicators: Array.isArray(raw.indicators)
      ? raw.indicators.map((i: Record<string, unknown>) => ({
          icon: String(i.icon || "⚠️"),
          title: String(i.title || "Unknown"),
          severity: (["low", "medium", "high"].includes(String(i.severity)) ? i.severity : "medium") as "low" | "medium" | "high",
          description: String(i.description || "Review this indicator carefully."),
        }))
      : [],
    verificationSteps: Array.isArray(raw.verificationSteps)
      ? raw.verificationSteps.map((s: unknown) => String(s))
      : ["Search the company name on Google and LinkedIn to verify it exists."],
  };
}

// ── Groq (Primary) ─────────────────────────────────────────────
async function callGroq(text: string): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert cybersecurity analyst. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: ANALYSIS_PROMPT + text,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");

  return JSON.parse(content) as AnalysisResult;
}

// ── Gemini (Fallback) ───────────────────────────────────────────
async function callGemini(text: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: ANALYSIS_PROMPT + text }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text;
  if (!content) throw new Error("Empty response from Gemini");

  return JSON.parse(content) as AnalysisResult;
}
