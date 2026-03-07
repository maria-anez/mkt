import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key?.slice(0, 10) ?? "none",
    isPlaceholder: key === "your_anthropic_api_key_here",
    nodeEnv: process.env.NODE_ENV,
  });
}
