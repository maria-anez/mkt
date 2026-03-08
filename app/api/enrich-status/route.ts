import { NextRequest, NextResponse } from "next/server";
import type { ClipMoment, CardSuggestion, AEOMatch } from "@/lib/types";

function parseJsonBlob(blob: unknown): Record<string, unknown> {
  if (!blob) return {};
  if (typeof blob === "object" && !Array.isArray(blob)) return blob as Record<string, unknown>;
  if (typeof blob === "string") {
    try {
      const trimmed = blob.trim();
      if (trimmed.startsWith("{")) return JSON.parse(trimmed);
      const fenceMatch = blob.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) return JSON.parse(fenceMatch[1].trim());
      const clean = trimmed
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      return JSON.parse(clean);
    } catch { return {}; }
  }
  return {};
}

export async function GET(req: NextRequest) {
  const executionId = req.nextUrl.searchParams.get("id");
  const airOpsKey   = process.env.AIROPS_API_KEY;

  if (!executionId || !airOpsKey) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.airops.com/public_api/airops_apps/executions/${executionId}`,
      {
        headers: {
          "Authorization": `Bearer ${airOpsKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) return NextResponse.json({ status: "error" });

    const data      = await res.json();
    const execution = data.airops_app_execution ?? data;
    const status    = execution.status;

    if (status === "error" || status === "cancelled") return NextResponse.json({ status: "error" });
    if (status !== "success") return NextResponse.json({ status: "pending" });

    const output = execution.output;
    if (!output) return NextResponse.json({ status: "error" });

    // Parse clip moments
    const clipData     = parseJsonBlob(output.moments);
    const momentsArray = Array.isArray(clipData.moments) ? clipData.moments : Array.isArray(output.moments) ? output.moments : [];
    const clipMoments: ClipMoment[] = momentsArray.map((m: {
      timestampStart?: string; timestampEnd?: string; format?: string;
      summary?: string; rationale?: string; suggestedTitle?: string; score?: number;
    }) => ({
      timestampStart: m.timestampStart ?? "00:00",
      timestampEnd:   m.timestampEnd   ?? "00:00",
      summary:        m.summary        ?? "",
      rationale:      m.rationale      ?? "",
      insightType:    (m.format === "short" ? "story" : "tactical") as ClipMoment["insightType"],
      score:          m.score          ?? 7,
      suggestedTitle: m.suggestedTitle,
      format:         m.format,
    }));

    // Parse card suggestions
    const cardData   = parseJsonBlob(output.cards);
    const cardsArray = Array.isArray(cardData.cards) ? cardData.cards : Array.isArray(output.cards) ? output.cards : [];
    const cardSuggestions: CardSuggestion[] = cardsArray.map((c: {
      title?: string; reason?: string; matchType?: string; timestamp?: string; context?: string;
    }) => ({
      video:     { title: c.title ?? "", url: "https://www.youtube.com/@AirOpsHQ", guest: "", topics: [] },
      reason:    c.reason    ?? "",
      matchType: (c.matchType ?? "topic") as CardSuggestion["matchType"],
      timestamp: c.timestamp,
      context:   c.context,
    }));

    // Parse AEO matches
    const aeoData  = parseJsonBlob(output.aeo_matches);
    const aeoArray = Array.isArray(aeoData.aeo_matches) ? aeoData.aeo_matches : Array.isArray(output.aeo_matches) ? output.aeo_matches : [];
    const aeoMatches: AEOMatch[] = aeoArray.map((m: {
      prompt?: string; quote?: string; timestamp?: string; why?: string;
    }) => ({
      prompt:    m.prompt    ?? "",
      quote:     m.quote     ?? "",
      timestamp: m.timestamp ?? "00:00",
      why:       m.why       ?? "",
    }));

    return NextResponse.json({ status: "success", clipMoments, cardSuggestions, aeoMatches });

  } catch (e) {
    console.error("[/api/enrich-status]", e);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
