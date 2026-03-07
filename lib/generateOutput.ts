import { callClaude } from "./claude";
import type { GenerateResult } from "./types";

export async function generateOutput(prompt: string): Promise<GenerateResult> {
  const raw = await callClaude(prompt);

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
