import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/buildPrompt";
import { mockGenerate } from "@/lib/mockGenerate";
import type { FormData, GenerateResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.json();

    // Validate required fields
    if (!data.videoTitle || !data.primaryKeyword || !data.guestName || !data.transcript) {
      return NextResponse.json(
        { error: "Missing required fields: videoTitle, primaryKeyword, guestName, transcript" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AIR_OPS_API_KEY;

    let description: string;

    if (apiKey && apiKey !== "your_airops_api_key_here") {
      // ─── Real AirOps integration ───────────────────────────────────────────
      // Swap this block when the AirOps endpoint is confirmed.
      //
      // const prompt = buildPrompt(data);
      //
      // const response = await fetch("https://api.airops.com/public_api/agent/YOUR_AGENT_ID/execute", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${apiKey}`,
      //   },
      //   body: JSON.stringify({ inputs: { prompt } }),
      // });
      //
      // const json = await response.json();
      // description = json.output ?? json.result ?? json.data?.output;
      //
      // ─── End AirOps integration ────────────────────────────────────────────

      // Temporary fallback until real endpoint is configured
      void buildPrompt(data); // keep import alive
      description = mockGenerate(data);
    } else {
      // No API key — use mock
      void buildPrompt(data); // keep import alive
      description = mockGenerate(data);
    }

    const result: GenerateResult = {
      description,
      characterCount: description.length,
    };

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[/api/generate]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
