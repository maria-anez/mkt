import { callClaude } from "./claude";
import type { TranscriptAnalysis } from "./types";

export async function analyzeTranscript(transcript: string): Promise<TranscriptAnalysis> {
  const prompt = `
You are analyzing a transcript to improve YouTube optimization.

Extract:
- 3–5 core themes
- 3–5 high-intent commercial phrases
- 1–3 strategic shifts
- 1–3 authority signals

Return JSON only. Use this exact structure:
{
  "coreThemes": ["..."],
  "commercialPhrases": ["..."],
  "strategicShifts": ["..."],
  "authoritySignals": ["..."]
}

No explanation. No markdown. JSON only.

Transcript:
${transcript}
  `.trim();

  const result = await callClaude(prompt);
  return JSON.parse(result) as TranscriptAnalysis;
}
