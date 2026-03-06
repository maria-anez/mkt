import fs from "fs";
import path from "path";
import type { FormData, TranscriptAnalysis } from "./types";

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

export function buildPrompt(data: FormData, analysis?: TranscriptAnalysis | null): string {
  const guidelines = loadChannelGuidelines();
  const format = formatLabel[data.videoType] ?? "CLIPS";
  const tone = toneInstructions[data.tonePreference] ?? toneInstructions["engagement"];
  const isWebinar = data.videoType === "webinar";
  const isShort = data.videoType === "short";

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

  const chapterInstruction = isShort
    ? `CHAPTERS: Generate 2–3 chapters. Detect real topic shifts. Estimate timestamps starting at 00:00.`
    : `CHAPTERS: Generate a minimum of 5 chapters. Detect major topic shifts from the transcript. Avoid generic labels. Reinforce primary keyword where natural. Estimate timestamps starting at 00:00 if none are in the transcript.`;

  return `${guidelines}

---

# ACTIVE FORMAT: ${format}

You are generating YouTube optimization content for a **${format}** video.

STRICT FORMAT ENFORCEMENT:
- Apply ONLY the ${format} rules defined in the channel guidelines above.
- Do NOT blend behaviors, tone, structure, or density from any other format (${Object.values(formatLabel).filter((f) => f !== format).join(", ")}).
- If any instruction below conflicts with the ${format} rules in the channel guidelines, the channel guidelines take precedence.
- Before finalizing any output, verify it conforms to the ${format} TITLE RULES, DESCRIPTION STRUCTURE RULES, and VOICE defined above.

---

# INPUTS

Primary keyword: ${data.primaryKeyword}
Video format: ${format}${data.videoTitle ? `\nOfficial title: ${data.videoTitle}` : ""}
Guest name: ${data.guestName}
Guest role: ${data.guestRole || "not provided"}
Guest company: ${data.guestCompany || "not provided"}
Tone modifier: ${tone}
Title variations requested: ${data.titleCount}

TRANSCRIPT:
${transcriptPreview}

${analysis ? `---

# PRE-EXTRACTED TRANSCRIPT INSIGHTS

The following analysis was run on the full transcript before this prompt. Use it to inform all outputs — do not repeat or restate it literally, but let it shape phrasing, framing, and emphasis.

Core themes:
${analysis.coreThemes.map((t) => `• ${t}`).join("\n")}

High-intent commercial phrases:
${analysis.commercialPhrases.map((p) => `• ${p}`).join("\n")}

Strategic shifts:
${analysis.strategicShifts.map((s) => `• ${s}`).join("\n")}

Authority signals:
${analysis.authoritySignals.map((a) => `• ${a}`).join("\n")}` : ""}

---

# STEP 1 — INTERNAL ANALYSIS (inform all outputs; do not include in response)

1. Extract 3–5 key insights from the transcript.
2. Identify the strongest authority signal from the guest metadata.
3. Identify the core tension or problem discussed.
4. Extract 3 semantic keyword phrases related to the primary keyword.
5. Determine the strategic objective for ${format} (from channel guidelines) and align all outputs to it.

---

# STEP 2 — GENERATE ALL 4 OUTPUTS

Return a JSON object with this exact structure:
{
  "titles": ["..."],
  "description": "...",
  "chapters": "00:00 Chapter title\\n02:30 Chapter title\\n...",
  "pinnedComment": "..."
}

${titleInstruction}

DESCRIPTION: Follow the ${format} DESCRIPTION STRUCTURE RULES exactly as defined in the channel guidelines.
- Pull semantic phrases from the transcript — do not invent them.
- No filler language. Active voice. Sentence case.
- Tone must match the ${format} VOICE defined in the channel guidelines.

${chapterInstruction}
- Format: MM:SS Title (one per line, no bullet points)

PINNED COMMENT (written as AirOps):
- Conversational but strategic. Confident, helpful, expert-level, but human.
- Reinforce the primary keyword naturally.
- Highlight why this guest matters in 1 line.
- Ask one thoughtful engagement question.
- Optional soft CTA. Max 1–2 emojis. Do not sound corporate or spammy.
- Structure: hook line → value reinforcement → engagement question → optional CTA

Return only the JSON object. No explanation, no markdown code fences.`;
}
