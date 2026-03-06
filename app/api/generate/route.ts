import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/buildPrompt";
import { mockGenerate } from "@/lib/mockGenerate";
import { analyzeTranscript } from "@/lib/analyzeTranscript";
import type { FormData, GenerateResult, TranscriptAnalysis } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();

    if (!data.primaryKeyword || !data.guestName || !data.transcript || !data.videoType) {
      return NextResponse.json(
        { error: "Missing required fields: primaryKeyword, guestName, transcript, videoType" },
        { status: 400 }
      );
    }

    data.titleCount = Math.min(Math.max(Number(data.titleCount) || 5, 1), 10);

    // ── Step 1: Analyze transcript with Claude ────────────────────────────
    // Runs when ANTHROPIC_API_KEY is set. Falls back to null gracefully —
    // the prompt still works without pre-extracted insights.
    let analysis: TranscriptAnalysis | null = null;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        analysis = await analyzeTranscript(data.transcript);
      } catch (e) {
        console.warn("[/api/generate] transcript analysis failed, continuing without it:", e);
      }
    }

    // ── Step 2: Build prompt with channel guidelines + analysis ──────────
    const prompt = buildPrompt(data, analysis);

    // ── Step 3: Generate outputs ──────────────────────────────────────────
    const airOpsKey = process.env.AIR_OPS_API_KEY;
    let result: GenerateResult;

    if (airOpsKey && airOpsKey !== "your_airops_api_key_here") {
      // ─── Real AirOps integration ────────────────────────────────────────
      //
      // const response = await fetch(
      //   "https://api.airops.com/public_api/agent/YOUR_AGENT_ID/execute",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${airOpsKey}`,
      //     },
      //     body: JSON.stringify({ inputs: { prompt } }),
      //   }
      // );
      //
      // const json = await response.json();
      // const raw = json.output ?? json.result ?? json.data?.output;
      // const parsed = JSON.parse(raw);
      //
      // result = {
      //   titles: parsed.titles,
      //   description: parsed.description,
      //   descriptionCharCount: parsed.description.length,
      //   chapters: parsed.chapters,
      //   pinnedComment: parsed.pinnedComment,
      // };
      //
      // ─── End AirOps integration ─────────────────────────────────────────

      void prompt; // keep buildPrompt call live
      result = mockGenerate(data);
    } else {
      void prompt;
      result = mockGenerate(data);
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
