import { NextRequest, NextResponse } from "next/server";
import { analyzeOffer } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid offer text (at least 20 characters)." },
        { status: 400 }
      );
    }

    // ── Gibberish / non-offer text detection ──
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter((w: string) => w.length > 0);
    const wordCount = words.length;

    // Must have at least 10 words to be a meaningful offer
    if (wordCount < 10) {
      return NextResponse.json(
        { error: "Please provide a valid offer letter or message. The text is too short to analyze." },
        { status: 400 }
      );
    }

    // Check for real English words — common words found in any offer/email
    const commonWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "shall", "can", "to", "of", "in", "for",
      "on", "with", "at", "by", "from", "this", "that", "it", "not", "but",
      "and", "or", "if", "so", "we", "you", "your", "our", "i", "my", "me",
      "he", "she", "they", "them", "his", "her", "its", "no", "yes",
      "dear", "hi", "hello", "please", "thank", "thanks", "regards",
      "company", "offer", "job", "internship", "role", "position", "salary",
      "payment", "pay", "work", "email", "contact", "team", "apply",
      "selected", "congratulations", "opportunity", "interview", "resume",
    ]);
    const recognizedWords = words.filter((w: string) =>
      commonWords.has(w.toLowerCase().replace(/[^a-z]/g, ""))
    );
    const recognizedRatio = recognizedWords.length / wordCount;

    // If less than 15% of words are recognizable English, it's likely gibberish
    if (recognizedRatio < 0.15) {
      return NextResponse.json(
        { error: "Please provide a valid offer letter or message. The text appears to be random characters, not a real offer." },
        { status: 400 }
      );
    }

    // Check if text has at least some sentence-like structure (contains letters and spaces)
    const letterRatio = (trimmed.match(/[a-zA-Z]/g) || []).length / trimmed.length;
    if (letterRatio < 0.4) {
      return NextResponse.json(
        { error: "Please provide a valid offer letter or message. The text doesn't appear to contain readable content." },
        { status: 400 }
      );
    }

    const result = await analyzeOffer(text.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze the offer. Please try again." },
      { status: 500 }
    );
  }
}
