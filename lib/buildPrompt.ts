import type { FormData } from "./types";

const toneInstructions: Record<string, string> = {
  engagement:
    "Write for maximum engagement. Use curiosity hooks, direct statements, and action-oriented phrasing. Prioritize click-through and watch time signals.",
  educational:
    "Write in a clear, informative tone. Lead with what the viewer will learn. Use precise language and authoritative framing.",
  analytical:
    "Write with data-driven, measured language. Emphasize insights, frameworks, and evidence. Avoid hype.",
  "bold-contrarian":
    "Write with a confident, direct, and contrarian angle. Challenge assumptions. Use strong declarative sentences.",
  conversational:
    "Write in a warm, direct, human tone. Sound like a knowledgeable peer — not a press release.",
  "executive-authority":
    "Write with executive-level authority. Emphasize expertise, outcomes, and high-stakes implications. Professional and precise.",
};

const shortFormInstructions = `
FORMAT: YouTube Short (60 seconds or less)
- Keep the description concise: 150-300 characters ideal
- Lead with the core insight in the first sentence
- No timestamps needed
- One clear CTA at the end
`;

const longFormInstructions = `
FORMAT: YouTube Long-form video (3+ minutes)
- Target 200-500 characters (YouTube indexes ~300 chars above the fold)
- Include 2-3 semantic keyword variations naturally in the text
- Add a timestamps section if talking points are provided
- Include a CTA and subscription prompt at the end
- Close with guest social/website if company is known
`;

export function buildPrompt(data: FormData): string {
  const formatInstructions =
    data.videoType === "short" ? shortFormInstructions : longFormInstructions;

  const toneGuide =
    toneInstructions[data.tonePreference] ?? toneInstructions["engagement"];

  const guestBlock =
    data.guestName
      ? `GUEST AUTHORITY:
Name: ${data.guestName}
Role: ${data.guestRole || "Not provided"}
Company: ${data.guestCompany || "Not provided"}
Instruction: Surface the guest's title and company early to build authority signals. Do not fabricate credentials.`
      : "";

  const talkingPointsBlock =
    data.keyTalkingPoints?.trim()
      ? `KEY TALKING POINTS (use for timestamps if long-form):
${data.keyTalkingPoints}`
      : "";

  const ctaBlock =
    data.callToAction?.trim()
      ? `CALL TO ACTION: ${data.callToAction}`
      : `CALL TO ACTION: Encourage viewers to subscribe for more content on ${data.primaryKeyword}.`;

  const transcriptPreview =
    data.transcript.length > 3000
      ? data.transcript.slice(0, 3000) + "\n[transcript truncated for length]"
      : data.transcript;

  return `You are an expert YouTube content strategist and SEO copywriter specializing in AI retrieval optimization (AEO) and search visibility.

Your task: Write a YouTube video description optimized for search discoverability, AI engine retrieval, and viewer engagement.

RULES:
- Extract keywords and semantic phrases directly from the transcript — do not invent them
- Reinforce the primary keyword naturally (do not keyword-stuff)
- Amplify guest authority using their name, role, and company
- Avoid generic filler phrases like "In this video we discuss..." or "Don't forget to like and subscribe"
- Use active voice and direct, specific language
- Never use banned words: synergize, robust, comprehensive, seamless, leverage (as verb), supercharge, groundbreaking, revolutionary
- Sentence case for all text (not title case)

${formatInstructions}

TONE INSTRUCTION:
${toneGuide}

VIDEO DETAILS:
Title: ${data.videoTitle}
Type: ${data.videoType === "short" ? "YouTube Short" : "Long-form video"}
Primary keyword: ${data.primaryKeyword}

${guestBlock}

TRANSCRIPT (extract phrasing and keywords from this):
${transcriptPreview}

${talkingPointsBlock}

${ctaBlock}

OUTPUT: Return only the final YouTube description. No explanation, no preamble, no markdown headers. Just the description text ready to paste into YouTube.`;
}
