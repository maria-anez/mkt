import { NextRequest, NextResponse } from "next/server";
import { mockGenerate } from "@/lib/mockGenerate";
import type { FormData, GenerateResult, ClipMoment, CardSuggestion, AEOMatch } from "@/lib/types";

function parseJsonBlob(blob: unknown): Record<string, unknown> {
  if (!blob) return {};
  if (typeof blob === "object" && !Array.isArray(blob)) return blob as Record<string, unknown>;
  if (typeof blob === "string") {
    try {
      const clean = blob
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      return JSON.parse(clean);
    } catch {
      return {};
    }
  }
  return {};
}

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

    console.log("[callAirOpsWorkflow] output keys:", Object.keys(output));

    // All 4 main copy fields point to the same JSON blob in the End node
    // Try each one until we get a parseable object
    let mainCopy: Record<string, unknown> = {};
    for (const key of ["titles", "description", "chapters", "pinnedComment"]) {
      const parsed = parseJsonBlob(output[key]);
      if (parsed.titles || parsed.description) {
        mainCopy = parsed;
        break;
      }
    }
    // If still empty, try parsing the whole output as the blob
    if (!mainCopy.titles && !mainCopy.description) {
      mainCopy = parseJsonBlob(output);
    }

    const titles = Array.isArray(mainCopy.titles)
      ? mainCopy.titles
      : Array.isArray(output.titles)
        ? output.titles
        : [];

    const description = typeof mainCopy.description === "string"
      ? mainCopy.description
      : typeof output.description === "string"
        ? output.description
        : "";

    const chapters = typeof mainCopy.chapters === "string"
      ? mainCopy.chapters
      : typeof output.chapters === "string"
        ? output.chapters
        : "";

    const pinnedComment = typeof mainCopy.pinnedComment === "string"
      ? mainCopy.pinnedComment
      : typeof output.pinnedComment === "string"
        ? output.pinnedComment
        : "";

    console.log("[callAirOpsWorkflow] titles parsed:", titles);
    console.log("[callAirOpsWorkflow] description length:", description.length);

    // Parse clip moments
    const clipData = parseJsonBlob(output.moments);
    const momentsArray = Array.isArray(clipData.moments)
      ? clipData.moments
      : Array.isArray(output.moments)
        ? output.moments
        : [];

    const clipMoments: ClipMoment[] = momentsArray.map((m: {
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

    // Parse card suggestions
    const cardData = parseJsonBlob(output.cards);
    const cardsArray = Array.isArray(cardData.cards)
      ? cardData.cards
      : Array.isArray(output.cards)
        ? output.cards
        : [];

    const cardSuggestions: CardSuggestion[] = cardsArray.map((c: {
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

    // Parse AEO matches
    const aeoData = parseJsonBlob(output.aeo_matches);
    const aeoArray = Array.isArray(aeoData.aeo_matches)
      ? aeoData.aeo_matches
      : Array.isArray(output.aeo_matches)
        ? output.aeo_matches
        : [];

    const aeoMatches: AEOMatch[] = aeoArray.map((m: {
      prompt?: string;
      quote?: string;
      timestamp?: string;
      why?: string;
    }) => ({
      prompt: m.prompt ?? "",
      quote: m.quote ?? "",
      timestamp: m.timestamp ?? "00:00",
      why: m.why ?? "",
    }));

    return {
      titles,
      description,
      descriptionCharCount: description.length,
      chapters,
      pinnedComment,
      clipMoments,
      cardSuggestions,
      aeoMatches,
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

    const result = await callAirOpsWorkflow(data);

    if (result) {
      console.log("[/api/generate] SUCCESS — returning real output");
      return NextResponse.json(result);
    }

    console.warn("[/api/generate] workflow failed — using mock");
    return NextResponse.json(mockGenerate(data));

  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
