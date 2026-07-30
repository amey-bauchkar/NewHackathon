"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

Here is the offer text to analyze:
`;

export async function analyzeOffer(text: string): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(ANALYSIS_PROMPT + text);
    const response = result.response;
    const jsonText = response.text();
    const parsed: AnalysisResult = JSON.parse(jsonText);

    // Ensure riskLevel matches riskScore
    if (parsed.riskScore <= 30) parsed.riskLevel = "safe";
    else if (parsed.riskScore <= 60) parsed.riskLevel = "suspicious";
    else parsed.riskLevel = "high-risk";

    return parsed;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze offer. Please try again.");
  }
}
