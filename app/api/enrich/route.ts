import { NextRequest, NextResponse } from "next/server";
import type { FormData, ClipMoment, CardSuggestion, AEOMatch } from "@/lib/types";

function parseJsonBlob(blob: unknown): Record<string, unknown> {
  if (!blob) return {};
  if (typeof blob === "object" && !Array.isArray(blob)) return blob as Record<string, unknown>;
  if (typeof blob === "string") {
    try {
      let clean = blob.trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      if (clean.startsWith('"') && clean.endsWith('"')) clean = JSON.parse(clean);
      return JSON.parse(clean);
    } catch { return {}; }
  }
  return {};
}

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();
    const airOpsKey  = process.env.AIROPS_API_KEY;
    const enrichUuid = process.env.AIROPS_ENRICH_UUID;

    if (!airOpsKey || !enrichUuid) {
      return NextResponse.json({ error: "Enrichment not configured" }, { status: 503 });
    }

    const response = await fetch(
      `https://api.airops.com/public_api/airops_apps/${enrichUuid}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${airOpsKey}`,
        },
        body: JSON.stringify({
          inputs: {
            video_type:    data.videoType,
            transcript:    data.transcript,
            transcript_summary: data.transcript.split(/\s+/).slice(0, 2000).join(" "),
            guest_name:    data.guestName,
            guest_role:    data.guestRole ?? "",
            guest_company: data.guestCompany ?? "",
            video_title:   data.videoTitle ?? "",
            recap_url:     data.recapUrl ?? "",
            takeaways:     data.takeaways ?? "",
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("[/api/enrich] error:", response.status, body);
      return NextResponse.json({ error: "Enrichment failed" }, { status: 500 });
    }

    const json      = await response.json();
    const execution = json.airops_app_execution ?? json;
    const output    = execution.output;

    if (!output) return NextResponse.json({});

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

    return NextResponse.json({ clipMoments, cardSuggestions, aeoMatches });

  } catch (e) {
    console.error("[/api/enrich]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
