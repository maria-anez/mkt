import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/buildPrompt";
import { mockGenerate } from "@/lib/mockGenerate";
import { generateOutput } from "@/lib/generateOutput";
import { analyzeTranscript } from "@/lib/analyzeTranscript";
import { matchPromptsFromQueries, localAirOpsPrompts } from "@/lib/matchPrompts";
import { fetchAirOpsPrompts } from "@/lib/fetchAirOpsPrompts";
import { extractMatchedMoments } from "@/lib/extractMatchedMoments";
import { scoreClipsFromTranscript } from "@/lib/scoreClips";
import { suggestCards } from "@/lib/suggestCards";
import type { FormData, GenerateResult, TranscriptAnalysis, MatchedMoment, ClipMoment, CardSuggestion } from "@/lib/types";
import type { MatchedPrompt } from "@/lib/matchPrompts";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();

    if (!data.guestName || !data.transcript || !data.videoType) {
      return NextResponse.json(
        { error: "Missing required fields: guestName, transcript, videoType" },
        { status: 400 }
      );
    }

    data.titleCount = Math.min(Math.max(Number(data.titleCount) || 5, 1), 10);

    let analysis: TranscriptAnalysis | null = null;
    let matchedPrompts: MatchedPrompt[] = [];
    let matchedMoments: MatchedMoment[] = [];
    let clipMoments: ClipMoment[] = [];
    let cardSuggestions: CardSuggestion[] = [];

    if (process.env.AIROPS_WORKFLOW_UUID || process.env.ANTHROPIC_API_KEY) {
      try {
        analysis = await analyzeTranscript(data.transcript);
      } catch (e) {
        console.warn("[/api/generate] transcript analysis failed:", e);
      }

      let airOpsPromptSource = await fetchAirOpsPrompts();
      if (!airOpsPromptSource.length) {
        airOpsPromptSource = localAirOpsPrompts;
      }

      if (analysis?.suggested_queries?.length) {
        try {
          matchedPrompts = matchPromptsFromQueries(
            analysis.suggested_queries,
            airOpsPromptSource
          );
        } catch (e) {
          console.warn("[/api/generate] prompt matching failed:", e);
        }
      }

      if (matchedPrompts.length) {
        try {
          matchedMoments = await extractMatchedMoments(
            data.transcript,
            matchedPrompts.map((m) => m.prompt)
          );
        } catch (e) {
          console.warn("[/api/generate] moment extraction failed:", e);
        }
      }

      if (data.videoType === "webinar") {
        try {
          clipMoments = await scoreClipsFromTranscript(
            data.transcript,
            data.guestName,
            data.videoType
          );
        } catch (e) {
          console.warn("[/api/generate] clip scoring failed:", e);
        }
      }

      if (analysis) {
        try {
          cardSuggestions = await suggestCards(
            analysis,
            data.guestName,
            data.videoTitle ?? ""
          );
        } catch (e) {
          console.warn("[/api/generate] card suggestions failed:", e);
        }
      }
    }

    const prompt = buildPrompt(data, analysis, matchedPrompts, matchedMoments);

    let result: GenerateResult;

    if (process.env.AIROPS_WORKFLOW_UUID || process.env.ANTHROPIC_API_KEY) {
      try {
        result = await generateOutput(prompt);
        console.log("[/api/generate] SUCCESS — real generation completed");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[/api/generate] FAILED — falling back to mock. Error:", msg);
        result = mockGenerate(data);
      }
    } else {
      console.warn("[/api/generate] NO WORKFLOW UUID OR API KEY — using mock");
      result = mockGenerate(data);
    }

    result.matchedMoments = matchedMoments;
    result.clipMoments = clipMoments;
    result.cardSuggestions = cardSuggestions;

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
