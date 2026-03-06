import fs from "fs";
import path from "path";
import type { FormData, TranscriptAnalysis } from "./types";
import type { MatchedPrompt } from "./matchPrompts";

function loadChannelGuidelines(): string {
  const filePath = path.join(process.cwd(), "channel-guidelines.md");
  return fs.readFileSync(filePath, "utf-8");
}

const formatLabel: Record<string, string> = {
  webinar: "WEBINAR",
  clip:    "CLIPS",
  short:   "SHORTS",
};

const toneInstructions: Record<string, string> = {
  engagement:
    "Optimize for maximum engagement. Use curiosity, direct statements, and action-oriented phrasing that drives click-through and watch time.",
  educational:
    "Clear, instructive tone. Lead with what the viewer will learn. Authoritative but accessible.",
  analytical:
    "Data-driven, measured language. Emphasize insights, frameworks, and evidence. No hype.",
  "bold-contrarian":
    "Confident, direct, and contrarian. Challenge assumptions. Strong declarative sentences.",
  conversational:
    "Warm and direct. Sound like a knowledgeable peer, not a press release.",
  "executive-authority":
    "Executive-level authority. Emphasize expertise, outcomes, and strategic implications. Professional and precise.",
};

/**
 * Required output sections and structural rules per format.
 * These are injected into the prompt to enforce strict output shape.
 */
function formatOutputRules(format: string, recapUrl: string): string {
  switch (format) {
    case "WEBINAR":
      return `REQUIRED OUTPUT SECTIONS FOR WEBINAR:
1. Title — use the official webinar name exactly; do NOT rewrite
2. Description — full-context framing paragraph, guest authority intro, strategic shift, why it matters now
3. Takeaways — 3–5 concise insight-led bullets (1–2 sentences each); embed within the description before the CTA
4. Timestamped chapters — minimum 5; format: MM:SS Title (one per line)
5. CTA — exactly one; placed at the end of the description; text: "Get all of the takeaways:" followed by ${recapUrl}
6. Pinned comment — AirOps voice

TIMESTAMP ENFORCEMENT: Timestamps are REQUIRED for this format.
CTA ENFORCEMENT: Include exactly one CTA. Do not add secondary CTAs, subscribe prompts, or additional links.`;

    case "CLIPS":
      return `REQUIRED OUTPUT SECTIONS FOR CLIPS:
1. Title — query-based, natural-language question, append "| AirOps"; under 70 characters
2. Description — repeat query on first line, speaker authority, direct evidence-backed answer, cause–effect logic
3. Takeaways — exactly 3; tactical or strategic; 1–2 sentences each; formatted as a "Learn:" bullet list within the description
4. Timestamped chapters — 3–5 chapters; format strictly as: MM:SS – Topic Name (one per line)
5. CTA — exactly one; placed at the end of the description; text: "Watch the full session:" followed by ${recapUrl}
6. Pinned comment — AirOps voice

TIMESTAMP ENFORCEMENT: Timestamps are REQUIRED for this format. Format strictly as MM:SS – Topic Name.
CTA ENFORCEMENT: Include exactly one CTA. Do not add secondary CTAs, subscribe prompts, or additional links.`;

    case "SHORTS":
      return `REQUIRED OUTPUT SECTIONS FOR SHORTS:
1. Title — engagement-led; short declarative statement or outcome-focused question; no AI query framing
2. Description — speaker authority on first line, why the insight matters, do not over-teach, keep concise
3. Takeaways — 2–3 takeaways; 1 sentence each; reinforce the main insight; do not over-explain
4. CTA — exactly one; neutral and concise; placed at the end; text: "Watch the full session:" followed by ${recapUrl}
5. Pinned comment — AirOps voice

TIMESTAMP ENFORCEMENT: Do NOT include timestamps in description or chapters for this format. Return chapters as an empty string.
CTA ENFORCEMENT: Include exactly one CTA. Do not add secondary CTAs, subscribe prompts, or additional links.`;

    default:
      return "";
  }
}

export function buildPrompt(
  data: FormData,
  analysis?: TranscriptAnalysis | null,
  matchedPrompts?: MatchedPrompt[]
): string {
  const guidelines  = loadChannelGuidelines();
  const format      = formatLabel[data.videoType] ?? "CLIPS";
  const tone        = toneInstructions[data.tonePreference] ?? toneInstructions["engagement"];
  const recapUrl    = data.recapUrl?.trim() || "{{WEBINAR_RECAP_URL}}";
  const isWebinar   = data.videoType === "webinar";
  const outputRules = formatOutputRules(format, recapUrl);

  const transcriptPreview =
    data.transcript.length > 4000
      ? data.transcript.slice(0, 4000) + "\n[transcript truncated]"
      : data.transcript;

  const titleInstruction = isWebinar
    ? `TITLES: The official webinar title has been provided. Return it exactly as given — do NOT rewrite, rephrase, or generate variations. Return it as a single-item array.
Official title: "${data.videoTitle ?? ""}"`
    : `TITLES: Generate ${data.titleCount} title variations following the ${format} TITLE RULES defined in the channel guidelines above.
- Each title must use a different framing angle
- Under 70 characters each
- No clickbait, no hype, sentence case`;

  return `${guidelines}

---

# ACTIVE FORMAT: ${format}

You are generating YouTube optimization content for a **${format}** video.

STRICT FORMAT ENFORCEMENT:
- Apply ONLY the ${format} rules defined in the channel guidelines above.
- Do NOT blend behaviors, tone, structure, or density from any other format (${Object.values(formatLabel).filter((f) => f !== format).join(", ")}).
- If any instruction below conflicts with the ${format} rules in the channel guidelines, the channel guidelines take precedence.
- Before finalizing any output, verify it conforms to the ${format} TITLE RULES, DESCRIPTION STRUCTURE RULES, TAKEAWAY RULES, CTA RULES, TIMESTAMP RULES, and VOICE defined above.

---

# REQUIRED OUTPUT STRUCTURE

${outputRules}

---

# INPUTS

Primary keyword: ${data.primaryKeyword}
Video format: ${format}${data.videoTitle ? `\nOfficial title: ${data.videoTitle}` : ""}
Guest name: ${data.guestName}
Guest role: ${data.guestRole || "not provided"}
Guest company: ${data.guestCompany || "not provided"}
Tone modifier: ${tone}
Title variations requested: ${data.titleCount}
Recap URL: ${recapUrl}

TRANSCRIPT:
${transcriptPreview}

---
${analysis ? `
# PRE-EXTRACTED TRANSCRIPT INSIGHTS

The following analysis was run on the full transcript before this prompt. Use it to inform all outputs — do not repeat or restate it literally, but let it shape phrasing, framing, and emphasis.

Core themes:
${analysis.core_themes.map((t) => `• ${t}`).join("\n")}

Strategic shifts:
${analysis.strategic_shifts.map((s) => `• ${s}`).join("\n")}

Authority signals:
${analysis.authority_signals.map((a) => `• ${a}`).join("\n")}

High-intent commercial phrases:
${analysis.commercial_intent.map((p) => `• ${p}`).join("\n")}

Suggested AI search queries (grounded in this transcript):
${analysis.suggested_queries.map((q) => `• ${q}`).join("\n")}

---` : ""}${matchedPrompts && matchedPrompts.length > 0 ? `
# VISIBILITY QUERY ALIGNMENT

These AirOps prompts were matched against the transcript's AI search queries. Use them to elevate the authority framing and search visibility of all outputs.

Matched high-visibility prompts:
${matchedPrompts.map((m) => `• ${m.prompt.name} — ${m.reason}`).join("\n")}

---` : ""}

# GENERATION INSTRUCTIONS

${titleInstruction}

DESCRIPTION: Follow the ${format} DESCRIPTION STRUCTURE RULES and TAKEAWAY RULES exactly as defined in the channel guidelines.
- Pull semantic phrases from the transcript — do not invent them.
- Embed takeaways within the description body before the CTA.
- No filler language. Active voice. Sentence case.
- Tone must match the ${format} VOICE defined in the channel guidelines.
- End description with exactly one CTA using recap URL: ${recapUrl}

CHAPTERS: Follow the ${format} TIMESTAMP RULES exactly as defined in the channel guidelines.
- WEBINAR/CLIPS: Include timestamped chapters in the chapters field.
- SHORTS: Return an empty string "" for chapters. Do not generate timestamps.

PINNED COMMENT (written as AirOps — follow PINNED COMMENT RULES from channel guidelines):

GENERAL RULES (all formats):
- 1–3 short lines maximum. No long paragraphs.
- No corporate tone. No self-referential brand commentary.
- No over-explaining the insight. Do not restate the full thesis.
- At most 1 engagement question. Tone: sharp, confident, conversational.
- Do not repeat the description.

${format === "WEBINAR"
  ? `WEBINAR STYLE:
- Distill the core idea into 1 punchy line.
- Follow with 1 clean engagement question.
- No recap link in the comment.`
  : format === "CLIPS"
  ? `CLIP STYLE:
- Highlight the tension or implication of the insight.
- Follow with 1 evaluation-stage question.
- Keep concise and sharp.`
  : `SHORT STYLE:
- Can be slightly playful or bold.
- 1 strong line.
- Optional short engagement question.
- Keep native to YouTube tone.`
}

Return a JSON object with this exact structure:
{
  "titles": ["..."],
  "description": "...",
  "chapters": "...",
  "pinnedComment": "..."
}

Return only the JSON object. No explanation, no markdown code fences.`;
}
