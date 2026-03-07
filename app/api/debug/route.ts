import { NextResponse } from "next/server";

export async function GET() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const airOpsKey = process.env.AIROPS_API_KEY;
  const workflowUuid = process.env.AIROPS_WORKFLOW_UUID;

  return NextResponse.json({
    anthropic: {
      hasKey: !!anthropicKey,
      keyLength: anthropicKey?.length ?? 0,
      keyPrefix: anthropicKey?.slice(0, 10) ?? "none",
    },
    airops: {
      hasKey: !!airOpsKey,
      keyLength: airOpsKey?.length ?? 0,
      keyPrefix: airOpsKey?.slice(0, 10) ?? "none",
    },
    workflow: {
      hasUuid: !!workflowUuid,
      uuidPrefix: workflowUuid?.slice(0, 8) ?? "none",
    },
    nodeEnv: process.env.NODE_ENV,
  });
}
