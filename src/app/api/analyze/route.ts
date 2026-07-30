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
