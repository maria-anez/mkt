import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/buildPrompt";
import { mockGenerate } from "@/lib/mockGenerate";
import { analyzeTranscript } from "@/lib/analyzeTranscript";
import { matchPromptsFromQueries, localAirOpsPrompts } from "@/lib/matchPrompts";
import { fetchAirOpsPrompts } from "@/lib/fetchAirOpsPrompts";
import { extractMatchedMoments } from "@/lib/extractMatchedMoments";
import { suggestCards } from "@/lib/suggestCards";
import type { FormData, GenerateResult, TranscriptAnalysis, MatchedMoment, ClipMoment, CardSuggestion } from "@/lib/types";
import type { MatchedPrompt } from "@/lib/matchPrompts";

async function callAirOpsWorkflow(data: FormData): Promise<GenerateResult | null> {
  const airOpsKey = process.env.AIROPS_API_KEY;
  const workflowUuid = process.env.AIROPS_WORKFLOW_UUID;

  if (!airOpsKey || !workflowUuid) return null;

  try {
    const response = await fetch(
      `https://api.airops.com/public_api/airops_apps/${workflowUuid}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${airOpsKey}`,
        },
        body: JSON.stringify({
          inputs: {
            video_type: data.videoType,
            transcript: data.transcript,
            guest_name: data.guestName,
            guest_role: data.guestRole ?? "",
            guest_company: data.guestCompany ?? "",
            video_title: data.videoTitle ?? "",
            recap_url: data.recapUrl ?? "",
            takeaways: data.takeaways ?? "",
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("[callAirOpsWorkflow] API error:", response.status, body);
      return null;
    }

    const data2 = await response.json();
    const execution = data2.airops_app_execution ?? data2;
    const output = execution.output;

    if (!output) return null;

    // Parse moments from clip scoring step
    let clipMoments: ClipMoment[] = [];
    if (Array.isArray(output.moments)) {
      clipMoments = output.moments.map((m: {
        timestampStart?: string;
        timestampEnd?: string;
        format?: string;
        summary?: string;
        rationale?: string;
        suggestedTitle?: string;
        score?: number;
      }) => ({
        timestampStart: m.timestampStart ?? "00:00",
        timestampEnd: m.timestampEnd ?? "00:00",
        summary: m.summary ?? "",
        rationale: m.rationale ?? "",
        insightType: (m.format === "short" ? "story" : "tactical") as ClipMoment["insightType"],
        score: m.score ?? 7,
        suggestedTitle: m.suggestedTitle,
        format: m.format,
      }));
    }

    const description = output.description ?? "";

    return {
      titles: output.titles ?? [],
      description,
      descriptionCharCount: description.length,
      chapters: output.chapters ?? "",
      pinnedComment: output.pinnedComment ?? "",
      clipMoments,
    };
  } catch (e) {
    console.error("[callAirOpsWorkflow] failed:", e);
    return null;
  }
}

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

    // Step 1 — Try AirOps workflow first (handles generation + clip scoring natively)
    const workflowResult = await callAirOpsWorkflow(data);

    let result: GenerateResult;
    let matchedMoments: MatchedMoment[] = [];
    let cardSuggestions: CardSuggestion[] = [];

    if (workflowResult) {
      console.log("[/api/generate] SUCCESS — AirOps workflow returned real output");
      result = workflowResult;
    } else {
      console.warn("[/api/generate] workflow failed — falling back to mock");
      result = mockGenerate(data);
    }

    // Step 2 — Run AEO prompt matching + card suggestions in parallel
    // These don't depend on the workflow and can run independently
    if (process.env.AIROPS_API_KEY) {
      try {
        // Analyze transcript for AEO matching
        let analysis: TranscriptAnalysis | null = null;
        try {
          const { analyzeTranscript: analyze } = await import("@/lib/analyzeTranscript");
          analysis = await analyze(data.transcript);
        } catch (e) {
          console.warn("[/api/generate] transcript analysis failed:", e);
        }

        // Load live AirOps prompts
        let airOpsPromptSource = await fetchAirOpsPrompts();
        if (!airOpsPromptSource.length) {
          airOpsPromptSource = localAirOpsPrompts;
        }

        // Match prompts
        let matchedPrompts: MatchedPrompt[] = [];
        if (analysis?.suggested_queries?.length) {
          matchedPrompts = matchPromptsFromQueries(
            analysis.suggested_queries,
            airOpsPromptSource
          );
        }

        // Extract matched moments
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

        // Suggest cards
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
      } catch (e) {
        console.warn("[/api/generate] AEO pipeline failed:", e);
      }
    }

    result.matchedMoments = matchedMoments;
    result.cardSuggestions = cardSuggestions;

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
