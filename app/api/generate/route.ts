import { NextRequest, NextResponse } from "next/server";
import { mockGenerate } from "@/lib/mockGenerate";
import type { FormData, GenerateResult, ClipMoment, CardSuggestion } from "@/lib/types";

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

    const json = await response.json();
    const execution = json.airops_app_execution ?? json;
    const output = execution.output;

    if (!output) {
      console.error("[callAirOpsWorkflow] no output in response");
      return null;
    }

    console.log("[callAirOpsWorkflow] SUCCESS — output keys:", Object.keys(output));

    // Parse clip moments from Score Clip Moments step
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

    // Parse card suggestions from Suggest Cards step
    let cardSuggestions: CardSuggestion[] = [];
    if (Array.isArray(output.cards)) {
      cardSuggestions = output.cards.map((c: {
        title?: string;
        reason?: string;
        matchType?: string;
      }) => ({
        video: {
          title: c.title ?? "",
          url: `https://www.youtube.com/@AirOpsHQ`,
          guest: "",
          topics: [],
        },
        reason: c.reason ?? "",
        matchType: (c.matchType ?? "topic") as CardSuggestion["matchType"],
      }));
    }

    const description = output.description ?? "";

    return {
      titles: Array.isArray(output.titles) ? output.titles : [output.titles ?? ""],
      description,
      descriptionCharCount: description.length,
      chapters: output.chapters ?? "",
      pinnedComment: output.pinnedComment ?? "",
      clipMoments,
      cardSuggestions,
    };
  } catch (e) {
    console.error("[callAirOpsWorkflow] failed:", e instanceof Error ? e.message : e);
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

    // Call AirOps workflow — handles generation, clip scoring, and card suggestions
    const result = await callAirOpsWorkflow(data);

    if (result) {
      console.log("[/api/generate] SUCCESS — returning real output");
      return NextResponse.json(result);
    }

    // Fallback to mock if workflow fails
    console.warn("[/api/generate] workflow failed — using mock");
    return NextResponse.json(mockGenerate(data));

  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
