import type { FormData, GenerateResult } from "./types";

/**
 * Simulates structured AirOps output for development.
 * Swap with real AirOps API call in app/api/generate/route.ts.
 */
export function mockGenerate(data: FormData): GenerateResult {
  const kw      = data.primaryKeyword ?? "AI search";
  const guest   = data.guestName;
  const role    = data.guestRole    || "expert";
  const company = data.guestCompany || "their company";
  const count   = data.titleCount   || 5;

  // ─── WEBINAR ─────────────────────────────────────────────────────────────
  if (data.videoType === "webinar") {
    const officialTitle = data.videoTitle?.trim() || `${kw} | AirOps & ${guest}`;

    const description =
`${guest} (${role} at ${company}) joined us to break down how ${kw} is reshaping the way teams think about content, visibility, and long-term authority — revealing what needs to change before the window closes.

- ${kw} is no longer just a channel strategy. It's a systems problem.
- Authority signals matter more than volume in AI-first discovery.
- The teams winning now built infrastructure before it was obvious.
- Measurement frameworks haven't caught up — most teams are flying blind.
- Speed of iteration separates leaders from laggards.

Get all of the takeaways:
https://www.airops.com/blog/webinar-recap`;

    const chapters =
`00:00 Introduction and why ${kw} is the defining shift right now
04:20 Who is ${guest} and what makes their vantage point different
11:00 The core tension: why standard approaches to ${kw} break down
19:30 The framework ${company} uses to think about ${kw} at scale
28:15 Tactical breakdown — what actually works and what doesn't
36:40 Measuring what matters when traditional metrics don't apply
44:10 Where ${kw} is headed and how to position your team now
51:00 Q&A and closing thoughts`;

    const pinnedComment =
`${kw.charAt(0).toUpperCase() + kw.slice(1)} is an infrastructure problem — and most teams are still treating it like a content calendar problem.

What's your team's current approach — building systems, or optimizing tactics?`;

    return {
      titles: [officialTitle],
      description,
      descriptionCharCount: description.length,
      chapters,
      pinnedComment,
    };
  }

  // ─── CLIP ─────────────────────────────────────────────────────────────────
  if (data.videoType === "clip") {
    const allTitles = [
      `How does ${kw} affect AI search rankings? | AirOps`,
      `What does ${kw} actually change about content strategy? | AirOps`,
      `Why are teams that invest in ${kw} outperforming their peers? | AirOps`,
      `What signals determine ${kw} visibility in AI results? | AirOps`,
      `Can ${kw} predict citation likelihood in LLMs? | AirOps`,
      `What does ${guest} say is the biggest ${kw} mistake teams make? | AirOps`,
      `How do you measure ${kw} impact before clicks disappear? | AirOps`,
      `What's the real cost of ignoring ${kw}? | AirOps`,
      `Why is ${kw} now a systems problem, not a content problem? | AirOps`,
      `What does ${kw} optimization look like in practice? | AirOps`,
    ].slice(0, count);

    const description =
`${allTitles[0].replace(" | AirOps", "")}

${guest} (${role} at ${company}) explains the direct relationship between ${kw} and AI citation behavior — and why teams that understand this dynamic are building durable visibility while others lose ground.

Learn:
• Why ${kw} signals matter more than page-level optimization
• How to build content that earns citations, not just clicks
• The cause-and-effect logic behind AI-first discovery

Includes real examples and citation data from ${company}.`;

    const chapters =
`00:00 The question: how does ${kw} change the game?
00:45 ${guest}'s direct answer and the evidence behind it
02:10 What this means for your content and visibility strategy`;

    const pinnedComment =
`${kw.charAt(0).toUpperCase() + kw.slice(1)} is a citation signal — not just a ranking factor. Most teams haven't made that mental shift yet.

Where's your team on this?`;

    return {
      titles: allTitles,
      description,
      descriptionCharCount: description.length,
      chapters,
      pinnedComment,
    };
  }

  // ─── SHORT ────────────────────────────────────────────────────────────────
  const allTitles = [
    `${kw.charAt(0).toUpperCase() + kw.slice(1)} changes everything. Here's how`,
    `The ${kw} mistake most teams are still making`,
    `Why ${kw} is the wrong thing to optimize for`,
    `${guest} on ${kw}: the take nobody wants to hear`,
    `You're measuring ${kw} wrong`,
    `${kw.charAt(0).toUpperCase() + kw.slice(1)} isn't a content problem`,
    `What ${kw} actually requires (most teams aren't ready)`,
    `Stop guessing at ${kw}. Do this instead`,
    `${kw.charAt(0).toUpperCase() + kw.slice(1)}: the signal that changes everything`,
    `The ${kw} playbook nobody is following`,
  ].slice(0, count);

  const description =
`${guest} (${role}, ${company}) explains why ${kw} is the signal most teams are still underestimating — and what to do about it.

Watch the full session:
https://www.airops.com/blog/webinar-recap`;

  const chapters =
`00:00 The insight on ${kw}
00:25 Why it matters right now
00:55 The one thing to change`;

  const pinnedComment = `This ${kw} take from ${guest} hits differently. Are you already thinking this way?`;

  return {
    titles: allTitles,
    description,
    descriptionCharCount: description.length,
    chapters,
    pinnedComment,
  };
}
