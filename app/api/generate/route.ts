import { NextRequest, NextResponse } from "next/server";
import { mockGenerate } from "@/lib/mockGenerate";
import type { FormData, GenerateResult, ClipMoment, CardSuggestion, AEOMatch } from "@/lib/types";

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

async function executeWorkflow(
  workflowUuid: string,
  airOpsKey: string,
  inputs: Record<string, string>
): Promise<Record<string, unknown> | null> {

  // Step 1 — fire async execute
  const startRes = await fetch(
    `https://api.airops.com/public_api/airops_apps/${workflowUuid}/async_execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${airOpsKey}`,
      },
      body: JSON.stringify({ inputs }),
    }
  );

  if (!startRes.ok) {
    // Fallback to sync execute if async not available
    const syncRes = await fetch(
      `https://api.airops.com/public_api/airops_apps/${workflowUuid}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${airOpsKey}`,
        },
        body: JSON.stringify({ inputs }),
      }
    );
    if (!syncRes.ok) return null;
    const syncData = await syncRes.json();
    const syncExec = syncData.airops_app_execution ?? syncData;
    return syncExec.output ?? null;
  }

  const startData = await startRes.json();
  const executionId = startData.airops_app_execution?.id ?? startData.id;

  if (!executionId) return null;

  console.log("[executeWorkflow] async execution started:", executionId);

  // Step 2 — poll for result
  const maxAttempts = 20;
  const intervalMs = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const pollRes = await fetch(
      `https://api.airops.com/public_api/airops_apps/executions/${executionId}`,
      {
        headers: {
          "Authorization": `Bearer ${airOpsKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!pollRes.ok) continue;

    const pollData = await pollRes.json();
    const execution = pollData.airops_app_execution ?? pollData;
    const status = execution.status;

    console.log(`[executeWorkflow] poll ${i + 1} — status: ${status}`);

    if (status === "success") return execution.output ?? null;
    if (status === "error" || status === "cancelled") return null;
  }

  return null;
}

async function callAirOpsWorkflow(data: FormData): Promise<GenerateResult | null> {
  const airOpsKey   = process.env.AIROPS_API_KEY;
  const workflowUuid = process.env.AIROPS_WORKFLOW_UUID;

  if (!airOpsKey || !workflowUuid) return null;

  try {
    const inputs = {
      video_type:           data.videoType,
      transcript:           data.transcript,
      transcript_summary:   data.transcript.split(/\s+/).slice(0, 2000).join(" "),
      guest_name:           data.guestName,
      guest_role:           data.guestRole ?? "",
      guest_company:        data.guestCompany ?? "",
      video_title:          data.videoTitle ?? "",
      recap_url:            data.recapUrl || "none",
      takeaways:            data.takeaways || "none",
    };

    const output = await executeWorkflow(workflowUuid, airOpsKey, inputs);

    if (!output) {
      console.error("[callAirOpsWorkflow] no output returned");
      return null;
    }

    console.log("[callAirOpsWorkflow] SUCCESS — output keys:", Object.keys(output));

    // Parse main copy — all 4 fields point to same JSON blob
    let mainCopy: Record<string, unknown> = {};
    for (const key of ["titles", "description", "chapters", "pinnedComment"]) {
      const parsed = parseJsonBlob(output[key]);
      if (parsed.titles || parsed.description) { mainCopy = parsed; break; }
    }
    if (!mainCopy.titles && !mainCopy.description) mainCopy = parseJsonBlob(output);

    const titles        = Array.isArray(mainCopy.titles) ? mainCopy.titles : Array.isArray(output.titles) ? output.titles : [];
    const description   = typeof mainCopy.description === "string" ? mainCopy.description : "";
    const chapters      = typeof mainCopy.chapters === "string" ? mainCopy.chapters : "";
    const pinnedComment = typeof mainCopy.pinnedComment === "string" ? mainCopy.pinnedComment : "";

    console.log("[callAirOpsWorkflow] titles:", titles);

    return {
      titles: Array.isArray(titles) ? titles : [String(titles)],
      description,
      descriptionCharCount: description.length,
      chapters,
      pinnedComment,
      clipMoments: [],
      cardSuggestions: [],
      aeoMatches: [],
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
