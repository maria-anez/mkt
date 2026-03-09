import { NextRequest, NextResponse } from "next/server";
import type { FormData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();

    if (!data.guestName || !data.transcript || !data.videoType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const airOpsKey    = process.env.AIROPS_API_KEY;
    const workflowUuid = process.env.AIROPS_WORKFLOW_UUID;

    if (!airOpsKey || !workflowUuid) {
      return NextResponse.json({ error: "API not configured" }, { status: 503 });
    }

    const response = await fetch(
      `https://api.airops.com/public_api/airops_apps/${workflowUuid}/async_execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${airOpsKey}`,
        },
        body: JSON.stringify({
          inputs: {
            video_type:         data.videoType,
            transcript:         data.transcript,
            transcript_summary: data.transcript.split(/\s+/).slice(0, 2000).join(" "),
            guest_name:         data.guestName,
            guest_role:         data.guestRole ?? "",
            guest_company:      data.guestCompany ?? "",
            video_title:        data.videoTitle || "Untitled",
            recap_url:          data.recapUrl || "none",
            takeaways: (data.videoType === "webinar" && data.takeaways) ? data.takeaways : "none",
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("[/api/generate] async_execute error:", response.status, body);
      return NextResponse.json({ error: "Workflow failed to start" }, { status: 500 });
    }

    const json        = await response.json();
    const executionId = json.airops_app_execution?.id ?? json.id;

    if (!executionId) {
      return NextResponse.json({ error: "No execution ID returned" }, { status: 500 });
    }

    console.log("[/api/generate] started execution:", executionId);
    return NextResponse.json({ executionId });

  } catch (e) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
