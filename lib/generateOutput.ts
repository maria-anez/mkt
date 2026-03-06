import { callClaude } from "./claude";
import type { GenerateResult } from "./types";

/**
 * Generates YouTube optimization output (titles, description, chapters,
 * pinned comment) by actually sending the built prompt to Claude.
 *
 * This replaces mockGenerate for real transcript-based generation.
 * The prompt is built by buildPrompt() and passed in here.
 */
export async function generateOutput(prompt: string): Promise<GenerateResult> {
  const raw = await callClaude(prompt);

  // Strip markdown code fences if present
  const clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(clean) as {
    titles: string[];
    description: string;
    chapters: string;
    pinnedComment: string;
  };

  return {
    titles: parsed.titles ?? [],
    description: parsed.description ?? "",
    descriptionCharCount: (parsed.description ?? "").length,
    chapters: parsed.chapters ?? "",
    pinnedComment: parsed.pinnedComment ?? "",
  };
}
