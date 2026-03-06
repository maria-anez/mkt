import type { FormData } from "./types";

/**
 * Simulates AirOps API response for development.
 * Replace with real AirOps API call in production.
 */
export function mockGenerate(data: FormData): string {
  const guestCredit =
    data.guestName && data.guestRole && data.guestCompany
      ? `${data.guestName}, ${data.guestRole} at ${data.guestCompany},`
      : data.guestName
      ? `${data.guestName}`
      : "our guest";

  const toneOpener: Record<string, string> = {
    engagement: `Most creators get ${data.primaryKeyword} wrong. Here's what actually moves the needle.`,
    educational: `A clear breakdown of ${data.primaryKeyword} — what it is, why it matters, and how to apply it today.`,
    analytical: `The data on ${data.primaryKeyword} is counterintuitive. ${guestCredit} unpacks the numbers.`,
    "bold-contrarian": `${data.primaryKeyword} isn't what you think. ${guestCredit} challenges the conventional playbook.`,
    conversational: `${guestCredit} sat down with us to talk ${data.primaryKeyword} — and the conversation got real.`,
    "executive-authority": `${guestCredit} on the strategic implications of ${data.primaryKeyword} for modern teams.`,
  };

  const opener =
    toneOpener[data.tonePreference] ?? toneOpener["engagement"];

  const ctaLine = data.callToAction?.trim()
    ? data.callToAction
    : `Subscribe for weekly insights on ${data.primaryKeyword} and content visibility.`;

  if (data.videoType === "short") {
    return `${opener}\n\n${ctaLine}`;
  }

  const talkingPointsSection =
    data.keyTalkingPoints?.trim()
      ? `\n\nTimestamps:\n${data.keyTalkingPoints
          .split("\n")
          .filter(Boolean)
          .map((point, i) => `00:${String(i * 2).padStart(2, "0")} — ${point.trim()}`)
          .join("\n")}`
      : "";

  return `${opener}

In this video, ${guestCredit} joins us to explore what ${data.primaryKeyword} means for visibility, discoverability, and long-term content authority. We cover the frameworks that actually work — pulled directly from the frontlines.

If you're producing content and not thinking about ${data.primaryKeyword}, you're already behind.${talkingPointsSection}

${ctaLine}`;
}
