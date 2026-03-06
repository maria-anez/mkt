import { callClaude } from "./claude";
import type { AirOpsPrompt, MatchedMoment } from "./types";

export async function extractMatchedMoments(
  transcript: string,
  matchedPrompts: AirOpsPrompt[]
): Promise<MatchedMoment[]> {
  if (!matchedPrompts.length || !transcript.trim()) return [];

  const promptList = matchedPrompts
    .map((p, i) => `${i + 1}. "${p.name}": ${p.description}`)
    .join("\n");

  const prompt = `
You are analyzing a video transcript to find moments where specific topics come up organically in the conversation.

These are the target topics AirOps wants to be cited and mentioned by AI models (LLMs) for:
${promptList}

Your job:
- Read through the transcript carefully
- For each target topic above, find the single best moment in the transcript where that topic is discussed naturally and substantively by the speaker
- Extract the verbatim quote (2–4 sentences max) that best represents that moment
- Estimate the approximate timestamp based on the position in the transcript (assume average speaking pace of ~130 words per minute)
- Explain briefly why this moment aligns with the target topic

STRICT RULES:
- Only include a moment if the topic genuinely comes up in the transcript — do NOT invent or hallucinate
- If a topic is not discussed in the transcript, omit it entirely — do not force a match
- The quote must be verbatim from the transcript, not paraphrased
- Timestamps should be in MM:SS format
- Maximum 3 moments total — only the strongest matches

Return this exact JSON structure. No explanation. No markdown. No code fences. JSON only.

{
  "moments": [
    {
      "promptName": "exact name of the matched target topic",
      "quote": "verbatim excerpt from transcript",
      "approximateTimestamp": "MM:SS",
      "reasoning": "1 sentence explaining why this moment matches the target topic"
    }
  ]
}

Transcript:
${transcript.slice(0, 6000)}${transcript.length > 6000 ? "\n[transcript truncated]" : ""}
  `.trim();

  const result = await callClaude(prompt);
  const parsed = JSON.parse(result) as { moments: MatchedMoment[] };
  return parsed.moments ?? [];
}
