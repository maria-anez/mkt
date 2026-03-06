import fs from "fs";
import path from "path";
import type { FormData, TranscriptAnalysis, MatchedMoment } from "./types";
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
  empowering:
    "Motivating and confident. Emphasize what the audience can do and achieve. Action-oriented, forward-looking, builds belief in the reader.",
  "functional-data":
    "Clear, precise, and evidence-led. Lead with data, outcomes, and measurable impact. No hype — let the numbers and logic do the work.",
  collaborative:
    "Warm, inclusive, and peer-to-peer. Sound like a knowledgeable partner sharing what's working. Avoid hierarchy or authority posture.",
  aspirational:
    "Visionary and inspiring. Paint a picture of what's possible. Connect the insight to a bigger shift or future the audience wants to be part of.",
  "witty-clever":
    "Sharp, playful, and intelligent. Use wit to make the insight land harder. Confident tone with a light touch — never try-hard.",
};

function formatOutputRules(format: string, recapUrl: string): string {
  switch (format) {
    case "WEBINAR":
      return `REQUIRED OUTPUT SECTIONS FOR WEBINAR:
1. Title — use the official webinar name exactly; do NOT rewrite
2. Description — full-context framing paragraph, guest authority intro, strategic shift, why it matters now
3. Takeaways — 3–5 concise insight-led bullets (1–2 sentences each); embed within the description before the CTA
4. Timestamped chapters — minimum 8; format: MM:SS Title (one per line)
5. CTA — exactly one; placed at the end of the description; text: "Get all of the takeaways:" followed by ${recapUrl}
6. Pinned comment — AirOps voice

TIMESTAMP ENFORCEMENT: Timestamps are REQUIRED for this format. Minimum 8 chapters. Read the actual transcript.
CTA ENFORCEMENT: Include exactly one CTA. Do not add secondary CTAs, subscribe prompts, or additional links.`;

    case "CLIPS":
      return `REQUIRED OUTPUT SECTIONS FOR CLIPS:
1. Title — derived from what the speaker actually says in the transcript; a direct quote, strong statement, or the core insight in their own words; append "| AirOps"; under 70 characters
2. Description — repeat the core insight on first line, speaker authority, direct evidence-backed answer, cause–effect logic
3. Takeaways — exactly 3; tactical or strategic; 1–2 sentences each; formatted as a "Learn:" bullet list within the description
4. CTA — exactly one; placed at the end of the description; text: "Watch the full session:" followed by ${recapUrl}
5. Pinned comment — AirOps voice

TIMESTAMP ENFORCEMENT: Do NOT include timestamps or chapters for this format. Return chapters as an empty string "".
CTA ENFORCEMENT: Include exactly one CTA. Do not add secondary CTAs, subscribe prompts, or additional links.`;

    case "SHORTS":
      return `REQUIRED OUTPUT SECTIONS FOR SHORTS:
1. Title — derived from what the speaker actually says; a direct quote or the core insight in their own words; no AI query framing
2. Description — speaker authority on first line, why the insight matters, do not over-teach, keep concise
3. Takeaways — 2–3 takeaways; 1 sentence each; reinforce the main insight; do not over-explain
4. CTA — exactly one; neutral and concise; placed at the end; text: "Watch the full session:" followed by ${recapUrl}
5. Pinned comment — AirOps voice

TIMESTAMP ENFORCEMENT: Do NOT include timestamps or chapters for this format. Return chapters as an empty string "".
CTA ENFORCEMENT: Include exactly one CTA. Do not add secondary CTAs, subscribe prompts, or additional links.`;

    default:
      return "";
  }
}

export function buildPrompt(
  data: FormData,
  analysis?: TranscriptAnalysis | null,
  matchedPrompts?: MatchedPrompt[],
  matchedMoments?: MatchedMoment[]
): string {
  const guidelines  = loadChannelGuidelines();
  const format      = formatLabel[data.videoType] ?? "CLIPS";
  const tone        = toneInstructions[data.tonePreference] ?? toneInstructions["engagement"];
  const recapUrl    = data.recapUrl?.trim() || "{{WEBINAR_RECAP_URL}}";
  const isWebinar   = data.videoType === "webinar";
  const isClipOrShort = data.videoType === "clip" || data.videoType === "short";
  const outputRules = formatOutputRules(format, recapUrl);

  const transcriptPreview =
    data.transcript.length > 12000
      ? data.transcript.slice(0, 12000) + "\n[transcript truncated]"
      : data.transcript;

  const titleInstruction = isWebinar
    ? `TITLES: The official webinar title has been provided. Return it exactly as given — do NOT rewrite, rephrase, or generate variations. Return it as a single-item array.
Official title: "${data.videoTitle ?? ""}"`
    : `TITLES: Generate ${data.titleCount} title variations for this ${format}.

CRITICAL TITLE RULES FOR CLIPS AND SHORTS:
- Titles MUST come from what the speaker actually says in the transcript
- Pull a direct quote, a strong statement, or the core insight in the speaker's own words
- A great title sounds like something the speaker said, not a keyword or topic label
- Example of a GOOD title: "Momentum Creates Clarity" (something the speaker actually said)
- Example of a BAD title: "Content Momentum changes everything" (generic topic label, not from transcript)
- Do NOT use the primary keyword as the title — find the real insight from the transcript
- Each title must use a different framing angle
- Under 70 characters each
- No clickbait, no hype, sentence case
- For CLIPS: append "| AirOps" at the end`;

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

${!isClipOrShort && data.primaryKeyword ? `Primary keyword: ${data.primaryKeyword}` : ""}
Video format: ${format}${data.videoTitle ? `\nOfficial title: ${data.videoTitle}` : ""}
Guest name: ${data.guestName}
Guest role: ${data.guestRole || "not provided"}
${data.guestCompany ? `Guest company: ${data.guestCompany}` : `Guest company: not provided — use name and role only`}
Tone modifier: ${tone}
Title variations requested: ${data.titleCount}
Recap URL: ${recapUrl}

TRANSCRIPT:
${transcriptPreview}

---
${isWebinar && data.takeaways?.trim() ? `
# PROVIDED TAKEAWAYS — USE EXACTLY AS GIVEN

The following takeaways have been provided and must be used verbatim in the description. Do NOT rewrite, summarize, or generate new takeaways. Use these exactly as written, formatted as a bullet list within the description before the CTA.

${data.takeaways.trim()}

---` : ""}${analysis ? `
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

---` : ""}${matchedMoments && matchedMoments.length > 0 ? `
# ORGANIC TRANSCRIPT MOMENTS — TARGET TOPIC ALIGNMENT

These are moments in the transcript where topics AirOps wants to be cited for in AI search come up organically in the conversation. These are the most strategically valuable moments in the video.

Use them as follows:
- TITLES: At least one title variation should be angled around the topic from the strongest matched moment
- CHAPTERS: Each matched moment MUST appear as a timestamped chapter at its given timestamp, with a chapter title that reflects the target topic naturally
- PINNED COMMENT: Reference the topic from the top matched moment in AirOps voice

Matched moments:
${matchedMoments.map((m, i) => `
Moment ${i + 1}: "${m.promptName}"
Timestamp: ${m.approximateTimestamp}
Quote: "${m.quote}"
Why it matters: ${m.reasoning}
`).join("\n")}

---` : ""}

# GENERATION INSTRUCTIONS

${titleInstruction}

DESCRIPTION: Follow the ${format} DESCRIPTION STRUCTURE RULES and TAKEAWAY RULES exactly as defined in the channel guidelines.
- Pull semantic phrases from the transcript — do not invent them.
${isWebinar && data.takeaways?.trim()
  ? `- TAKEAWAYS: Use the provided takeaways EXACTLY as written — do not rewrite or replace them.`
  : `- TAKEAWAYS: Generate takeaways from the transcript following the ${format} TAKEAWAY RULES.`}
- Embed takeaways within the description body before the CTA.
- No filler language. Active voice. Sentence case.
- Tone must match the ${format} VOICE defined in the channel guidelines.
- End description with exactly one CTA using recap URL: ${recapUrl}

CHAPTERS: Follow the ${format} TIMESTAMP RULES exactly as defined in the channel guidelines.
- WEBINAR only: Generate chapters by actually reading the transcript and identifying real topic shifts.
- Each chapter title must describe what is ACTUALLY discussed at that moment — use the speaker's real language and specific topics.
- Timestamps must be estimated from actual position in the transcript (~130 words per minute).
- Minimum 8 chapters for a full webinar. Cover the full arc of the conversation.
- NEVER use generic chapter titles like "Introduction", "Tactical breakdown", "Q&A and closing thoughts" unless those exact words appear in the transcript.
- CLIPS and SHORTS: Return an empty string "" for chapters. Never generate timestamps for clips or shorts.

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
