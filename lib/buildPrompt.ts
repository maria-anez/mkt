import type { FormData } from "./types";

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

export function buildPrompt(data: FormData): string {
  const tone = toneInstructions[data.tonePreference] ?? toneInstructions["engagement"];

  const transcriptPreview =
    data.transcript.length > 4000
      ? data.transcript.slice(0, 4000) + "\n[transcript truncated]"
      : data.transcript;

  const isShort = data.videoType === "short";

  return `You are an expert YouTube content strategist specializing in AEO (Answer Engine Optimization), search visibility, and creator growth.

Your task: analyze the transcript and guest metadata, then generate 4 outputs for a YouTube video.

INPUTS:
Primary keyword: ${data.primaryKeyword}
Video type: ${isShort ? "YouTube Short (under 60s)" : "Long-form video (3+ minutes)"}
Guest name: ${data.guestName}
Guest role: ${data.guestRole || "not provided"}
Guest company: ${data.guestCompany || "not provided"}
Tone: ${tone}
Number of title variations requested: ${data.titleCount}

TRANSCRIPT:
${transcriptPreview}

---

STEP 1 — INTERNAL ANALYSIS (use this to inform all outputs, do not include in response):
- Extract 3–5 key insights from the transcript
- Identify the strongest authority signal from the guest metadata
- Identify the core tension or problem discussed
- Extract 3 semantic keyword phrases related to the primary keyword

---

STEP 2 — GENERATE ALL 4 OUTPUTS:

Return a JSON object with this exact structure:
{
  "titles": [
    "Title using direct benefit angle (under 70 chars)",
    "Title using curiosity angle (under 70 chars)",
    "Title using authority-driven angle (under 70 chars)",
    "Title using contrarian/tension angle (under 70 chars)",
    "Title using tactical/outcome-driven angle (under 70 chars)"
  ],
  "description": "Full description text...",
  "chapters": "00:00 Chapter title\\n02:30 Chapter title\\n...",
  "pinnedComment": "AirOps pinned comment text..."
}

TITLE RULES:
- Each title must use a different framing angle
- Reinforce primary keyword naturally in most titles
- Under 70 characters each
- High-CTR but credible — no spam, no misleading claims
- Sentence case

DESCRIPTION RULES:
${isShort ? `Short format:
- Hook line (1 sentence, draws viewer in)
- Authority line (guest name, role, company)
- Tight 2–3 line summary of what was covered
- 3–5 relevant hashtags
- CTA (1 line)`
: `Long-form format:
- Search-optimized opening paragraph (keyword early, 2–3 sentences)
- Authority framing paragraph (guest credentials and why they matter)
- Structured summary of key points covered
- CTA
- 5–8 relevant hashtags`}
- Pull semantic phrases from the transcript — do not invent them
- No filler: never write "In this video we discuss..." or "Don't forget to like and subscribe"
- Active voice, sentence case

CHAPTER RULES:
${isShort ? `- 2–3 chapters only for Shorts` : `- Minimum 5 chapters for long-form`}
- Detect major topic shifts from the transcript
- Avoid generic labels like "Introduction" except at 00:00
- Reinforce primary keyword in chapter titles where natural
- If no real timestamps in transcript, estimate logical time blocks starting at 00:00
- Format: MM:SS Title (one per line)

PINNED COMMENT RULES (written as AirOps brand voice):
- Conversational but strategic
- Reinforce primary keyword naturally
- Highlight why this guest matters in 1 line
- Ask one thoughtful question to drive comments
- Optional soft CTA (not mandatory)
- Do NOT use excessive emojis (max 1–2 if any)
- Do NOT sound corporate or spammy
- Structure: hook line → value reinforcement → engagement question → optional CTA

Return only the JSON object. No explanation, no markdown code fences.`;
}
