import { NextRequest, NextResponse } from "next/server";
import type { FormData, ClipMoment, CardSuggestion, AEOMatch } from "@/lib/types";

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

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();
    const airOpsKey  = process.env.AIROPS_API_KEY;
    const enrichUuid = process.env.AIROPS_ENRICH_UUID;

    if (!airOpsKey || !enrichUuid) {
      return NextResponse.json({ error: "Enrichment not configured" }, { status: 503 });
    }

    // Use synchronous execute — this workflow doesn't support async_execute
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
            video_type:         data.videoType,
            transcript:         data.transcript.slice(0, 30000),
            transcript_summary: (() => {
              const lines = data.transcript.split("\n");
              const isVTT = data.transcript.includes("WEBVTT");
              if (isVTT) {
                let pastIntro = false;
                const contentLines: string[] = [];
                for (const line of lines) {
                  const timeMatch = line.match(/^(\d{2}):(\d{2}):(\d{2})/);
                  if (timeMatch) {
                    const seconds = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
                    if (seconds >= 180) pastIntro = true;
                    continue;
                  }
                  if (line.match(/^WEBVTT/) || line.match(/^\d+$/) || line.trim() === "") continue;
                  if (pastIntro) contentLines.push(line.trim());
                  if (contentLines.length >= 400) break;
                }
                return contentLines.join(" ");
              }
              return data.transcript.split(/\s+/).slice(400, 2400).join(" ");
            })(),
            guest_name:         data.guestName,
            guest_role:         data.guestRole ?? "",
            guest_company:      data.guestCompany ?? "",
            video_title:        data.videoTitle || "Untitled",
            recap_url:          data.recapUrl || "none",
            takeaways:          "none",
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

    if (!output) return NextResponse.json({ clipMoments: [], cardSuggestions: [], aeoMatches: [] });

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
