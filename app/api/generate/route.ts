import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/buildPrompt";
import { mockGenerate } from "@/lib/mockGenerate";
import type { FormData, GenerateResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();

    if (
      !data.primaryKeyword ||
      !data.guestName ||
      !data.transcript ||
      !data.videoType
    ) {
      return NextResponse.json(
        { error: "Missing required fields: primaryKeyword, guestName, transcript, videoType" },
        { status: 400 }
      );
    }

    // Ensure titleCount is valid
    data.titleCount = Math.min(Math.max(Number(data.titleCount) || 5, 1), 10);

    const apiKey = process.env.AIR_OPS_API_KEY;
    let result: GenerateResult;

    if (apiKey && apiKey !== "your_airops_api_key_here") {
      // ─── Real AirOps integration ───────────────────────────────────────
      // Uncomment and configure when AirOps endpoint is ready:
      //
      // const prompt = buildPrompt(data);
      //
      // const response = await fetch(
      //   "https://api.airops.com/public_api/agent/YOUR_AGENT_ID/execute",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${apiKey}`,
      //     },
      //     body: JSON.stringify({ inputs: { prompt } }),
      //   }
      // );
      //
      // const json = await response.json();
      // const raw = json.output ?? json.result ?? json.data?.output;
      // const parsed = JSON.parse(raw);
      //
      // result = {
      //   titles: parsed.titles,
      //   description: parsed.description,
      //   descriptionCharCount: parsed.description.length,
      //   chapters: parsed.chapters,
      //   pinnedComment: parsed.pinnedComment,
      // };
      //
      // ─── End AirOps integration ────────────────────────────────────────

      void buildPrompt(data); // keep import live until real integration
      result = mockGenerate(data);
    } else {
      void buildPrompt(data);
      result = mockGenerate(data);
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
