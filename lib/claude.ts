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

  const text =
    data.output?.response ||
    data.output?.text ||
    data.output ||
    data.result ||
    "";

  console.log("[callClaude] raw response keys:", Object.keys(data));
  console.log("[callClaude] data.output type:", typeof data.output);
  console.log("[callClaude] data.output value:", JSON.stringify(data.output)?.slice(0, 200));
  console.log("[callClaude] text result length:", String(text).length);

  if (!text) throw new Error("Empty response from AirOps workflow");

  return typeof text === "string" ? text : JSON.stringify(text);
}
