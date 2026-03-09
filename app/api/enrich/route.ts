import { NextRequest, NextResponse } from "next/server";
import type { FormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();
    const airOpsKey  = process.env.AIROPS_API_KEY;
    const enrichUuid = process.env.AIROPS_ENRICH_UUID;

    if (!airOpsKey || !enrichUuid) {
      return NextResponse.json({ error: "Enrichment not configured" }, { status: 503 });
    }

    const response = await fetch(
      `https://api.airops.com/public_api/airops_apps/${enrichUuid}/async_execute`,
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
                // Find first line after 3 minute mark
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
              // Plain text fallback — skip first 400 words
              return data.transcript.split(/\s+/).slice(400, 2400).join(" ");
            })(),
            guest_name:         data.guestName,
            guest_role:         data.guestRole ?? "",
            guest_company:      data.guestCompany ?? "",
            video_title:        data.videoTitle || "Untitled",
            recap_url:          data.recapUrl || "none",
            takeaways:          data.takeaways || "none",
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("[/api/enrich] async_execute error:", response.status, body);
      return NextResponse.json({ error: "Enrichment failed to start" }, { status: 500 });
    }

    const json        = await response.json();
    const executionId = json.airops_app_execution?.id ?? json.id;

    if (!executionId) {
      return NextResponse.json({ error: "No execution ID" }, { status: 500 });
    }

    console.log("[/api/enrich] started execution:", executionId);
    return NextResponse.json({ executionId });

  } catch (e) {
    console.error("[/api/enrich]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
