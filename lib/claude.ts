/**
 * Calls Claude via an AirOps workflow.
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

  console.log("[callClaude] response keys:", Object.keys(data));

  // AirOps wraps the execution in airops_app_execution
  const execution = data.airops_app_execution ?? data;
  const output = execution.output;

  console.log("[callClaude] output type:", typeof output);
  console.log("[callClaude] output value:", JSON.stringify(output)?.slice(0, 300));

  // Output can be a string directly, or an object with a text/response field
  const text =
    typeof output === "string"
      ? output
      : output?.response ||
        output?.text ||
        output?.result ||
        output?.content ||
        (typeof output === "object" ? JSON.stringify(output) : "");

  if (!text) throw new Error(`Empty response from AirOps workflow. Raw: ${JSON.stringify(data).slice(0, 200)}`);

  return text;
}
