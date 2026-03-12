import { NextRequest, NextResponse } from "next/server";
import type { GenerateResult, ClipMoment, CardSuggestion, AEOMatch } from "@/lib/types";

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
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
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

    if (!res.ok) {
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    const data      = await res.json();
    const execution = data.airops_app_execution ?? data;
    const status    = execution.status;

    console.log("[/api/status] execution:", executionId, "status:", status);

    if (status === "error" || status === "cancelled") {
      return NextResponse.json({ status: "error" });
    }

    if (status !== "success") {
      return NextResponse.json({ status: "pending" });
    }

    // Parse output
    const output = execution.output;
    if (!output) return NextResponse.json({ status: "error" });

    // Parse main copy
    let mainCopy: Record<string, unknown> = {};
    for (const key of ["titles", "description", "chapters", "pinnedComment"]) {
      const parsed = parseJsonBlob(output[key]);
      if (parsed.titles || parsed.description) { mainCopy = parsed; break; }
    }
    if (!mainCopy.titles && !mainCopy.description) mainCopy = parseJsonBlob(output);

    const titles        = Array.isArray(mainCopy.titles) ? mainCopy.titles : [];
    const description   = typeof mainCopy.description === "string" ? mainCopy.description : "";
    const chapters      = typeof mainCopy.chapters === "string" ? mainCopy.chapters : "";
    const pinnedComment = Array.isArray(mainCopy.pinnedComment)
      ? mainCopy.pinnedComment
      : Array.isArray(output.pinnedComment)
      ? output.pinnedComment
      : typeof mainCopy.pinnedComment === "string"
      ? mainCopy.pinnedComment
      : typeof output.pinnedComment === "string"
      ? output.pinnedComment
      : [];

    const result: GenerateResult = {
      titles,
      description,
      descriptionCharCount: description.length,
      chapters,
      pinnedComment,
      clipMoments:     [],
      cardSuggestions: [],
      aeoMatches:      [],
    };

    return NextResponse.json({ status: "success", result });

  } catch (e) {
    console.error("[/api/status]", e);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
