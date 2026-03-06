import type { FormData, GenerateResult } from "./types";

/**
 * Simulates structured AirOps output for development.
 * Swap with real AirOps API call in app/api/generate/route.ts.
 */
export function mockGenerate(data: FormData): GenerateResult {
  const kw = data.primaryKeyword;
  const guest = data.guestName;
  const role = data.guestRole || "expert";
  const company = data.guestCompany || "their company";
  const isShort = data.videoType === "short";
  const count = data.titleCount || 5;

  // ─── Titles ───────────────────────────────────────────────────────────────
  const allTitles = [
    `${kw}: what actually moves the needle in ${new Date().getFullYear()}`,
    `The ${kw} playbook nobody is talking about`,
    `${guest} on why most teams get ${kw} wrong`,
    `${kw} isn't what you think — here's the real strategy`,
    `How to win at ${kw} without starting from scratch`,
    `${guest}'s ${kw} framework that changed how we think`,
    `The truth about ${kw} from someone who's done it`,
    `Why ${kw} matters more than ever (and what to do about it)`,
    `${kw} explained in plain terms by ${guest} of ${company}`,
    `Stop guessing at ${kw} — do this instead`,
  ]
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .slice(0, count);

  const titles = allTitles;

  // ─── Description ─────────────────────────────────────────────────────────
  let description: string;

  if (isShort) {
    description = `Most people approach ${kw} backwards. Here's what actually works.

${guest}, ${role} at ${company}, breaks down the core insight in under 60 seconds.

Key takeaway: ${kw} isn't about volume — it's about signal quality and strategic positioning.

→ Subscribe for more ${kw} breakdowns every week.

#${kw.replace(/\s+/g, "")} #YouTube #ContentStrategy #AEO #CreatorTips`;
  } else {
    description = `${kw} is changing faster than most creators realize — and ${guest} has the receipts.

In this conversation, ${guest} (${role} at ${company}) unpacks the frameworks behind effective ${kw} strategy: what's working now, what's broken, and how to close the gap.

What we cover:
— Why most approaches to ${kw} stall out at the same point
— The authority signals that actually drive discoverability
— How to build a ${kw} system that compounds over time
— The tactical shift that separates high-visibility content from everything else

If you're serious about ${kw}, this one is worth your full attention.

→ Subscribe for weekly deep-dives on ${kw}, AEO, and content visibility.

#${kw.replace(/\s+/g, "")} #YouTubeStrategy #ContentEngineering #AEO #Discoverability #CreatorGrowth #${guest.split(" ")[0]}`;
  }

  // ─── Chapters ────────────────────────────────────────────────────────────
  let chapters: string;

  if (isShort) {
    chapters = [
      `00:00 The ${kw} mistake most people make`,
      `00:20 What ${guest} does differently`,
      `00:50 The one thing to change today`,
    ].join("\n");
  } else {
    chapters = [
      `00:00 Introduction — why ${kw} is the conversation right now`,
      `02:30 Who is ${guest} and what makes their perspective on ${kw} different`,
      `07:15 The core tension: why standard ${kw} approaches break down`,
      `13:40 The framework: how ${company} thinks about ${kw} at scale`,
      `21:00 Tactical breakdown — the moves that actually work`,
      `28:30 What most teams get wrong about ${kw} signals`,
      `35:10 Where ${kw} is headed and how to position now`,
      `41:00 Rapid-fire questions and closing thoughts`,
    ].join("\n");
  }

  // ─── Pinned Comment ───────────────────────────────────────────────────────
  const pinnedComment = `This one with ${guest} cuts through a lot of the noise around ${kw}.

The point about ${kw} being a signal quality problem — not a volume problem — is something we think about constantly at AirOps. ${role} at ${company} is one of the few people who's actually stress-tested this in the wild.

What's your current approach to ${kw}? Where are you stuck — or what's working better than expected?

${isShort ? `Full breakdown in the long-form version if you want to go deeper →` : `Drop your biggest ${kw} challenge below — we read every comment.`}`;

  return {
    titles,
    description,
    descriptionCharCount: description.length,
    chapters,
    pinnedComment,
  };
}
