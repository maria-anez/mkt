import { callClaude } from "./claude";
import type { TranscriptAnalysis } from "./types";

export async function analyzeTranscript(transcript: string): Promise<TranscriptAnalysis> {
  const prompt = `
You are analyzing a video transcript to extract structured signals for YouTube optimization and AI search visibility.

Extract the following and return as valid JSON only:

1. core_themes (3–5): The primary topics and concepts discussed. Be specific, not generic.

2. strategic_shifts (1–3): Moments where the speaker challenges conventional thinking, introduces a reframe, or signals a directional change in the field.

3. authority_signals (1–3): Specific credentials, data points, case studies, or expertise markers that establish the speaker's credibility.

4. commercial_intent (3–5): High-intent phrases a buyer or evaluator would use when researching this topic — terms that signal purchase consideration, vendor evaluation, or solution seeking.

5. suggested_queries (3–5): Natural-language questions a user would type into ChatGPT, Perplexity, or Gemini when researching the topics in this transcript.
   Rules for suggested_queries:
   - Write as a real user would ask — conversational, specific, decision-stage
   - Prefer evaluation-stage or commercial-intent queries over generic informational ones
   - Focus on visibility, citations, brand mentions, AI search, AEO, content strategy when relevant
   - Do NOT invent queries unrelated to the transcript
   - Queries must be grounded in the actual themes and language of the transcript
   - Examples of good queries: "how do I get my brand cited in ChatGPT answers", "what content strategy drives AI search citations", "how to measure brand visibility in LLMs"
   - Examples of bad queries: "what is AI", "how does YouTube work"

Return this exact JSON structure. No explanation. No markdown. No code fences. JSON only.

{
  "core_themes": ["..."],
  "strategic_shifts": ["..."],
  "authority_signals": ["..."],
  "commercial_intent": ["..."],
  "suggested_queries": ["..."]
}

Transcript:
${transcript}
  `.trim();

  const result = await callClaude(prompt);
  return JSON.parse(result) as TranscriptAnalysis;
}
