/**
 * Calls Claude via the AirOps YouTube Copy Generator workflow.
 * Uses AirOps enterprise Claude access — no personal Anthropic credits needed.
 * Requires AIROPS_API_KEY and AIROPS_WORKFLOW_UUID env vars.
 */
export async function callClaude(prompt: string): Promise<string> {
  const airOpsKey = process.env.AIROPS_API_KEY;
  const workflowUuid = process.env.AIROPS_WORKFLOW_UUID;

  if (!airOpsKey || !workflowUuid) {
    throw new Error("AIROPS_API_KEY and AIROPS_WORKFLOW_UUID must be set");
  }

  const response = await fetch(
    `https://api.airops.com/public_api/airops_apps/${workflowUuid}/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${airOpsKey}`,
      },
      body: JSON.stringify({
        inputs: { prompt },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AirOps API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const execution = data.airops_app_execution ?? data;
  const output = execution.output;

  if (output && typeof output === "object") {
    const result = {
      titles: output.titles ?? [],
      description: output.description ?? "",
      chapters: output.chapters ?? "",
      pinnedComment: output.pinnedComment ?? "",
      moments: output.moments ?? [],
    };
    return JSON.stringify(result);
  }

  if (typeof output === "string" && output.trim().startsWith("{")) {
    return output;
  }

  throw new Error(`Unexpected output shape: ${JSON.stringify(output)?.slice(0, 200)}`);
}
