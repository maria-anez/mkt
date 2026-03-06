import { callClaude } from "./claude";
import type { YouTubeVideo, CardSuggestion, TranscriptAnalysis } from "./types";

export const airOpsVideos: YouTubeVideo[] = [
  {
    title: "Reddit & Review Sites: The Pipeline Shift | AirOps & Ross Simmonds",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Ross Simmonds",
    topics: ["Reddit", "review sites", "pipeline", "off-site content", "community signals", "AI search", "brand mentions"],
  },
  {
    title: "A Workflow to Automate FAQ Generation | AirOps & Vivian Hoang from Webflow",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Vivian Hoang",
    topics: ["FAQ generation", "automation", "workflows", "Webflow", "content operations", "AI workflows"],
  },
  {
    title: "How to Win AI Search Shift | AirOps & Ethan Smith & Alex Halliday",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Ethan Smith",
    topics: ["AI search", "AEO", "search shift", "content strategy", "citations", "LLM visibility", "Graphite"],
  },
  {
    title: "AEO for Growth: The Art and Science of Growth Marketing | AirOps & Graphite & Webflow",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Ethan Smith",
    topics: ["AEO", "growth marketing", "answer engine optimization", "Webflow", "content strategy"],
  },
  {
    title: "ChatGPT vs. Google: The New Battleground | AirOps & Kevin Indig",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Kevin Indig",
    topics: ["ChatGPT", "Google", "AI search", "SEO vs AEO", "search battleground", "LLM search"],
  },
  {
    title: "Is Reddit the Secret Weapon for SEO and AEO Everyone's Missing? | AirOps & Ross Simmonds",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Ross Simmonds",
    topics: ["Reddit", "SEO", "AEO", "community content", "AI citations", "off-site signals"],
  },
  {
    title: "Behind the Build: Content Engineering | AirOps & Maddy French",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Maddy French",
    topics: ["content engineering", "workflows", "AI content", "content operations", "building content systems"],
  },
  {
    title: "AI + BoFu: Tactics to Unlock Revenue | AirOps & Ty Magnin, Vivian Hoang, and Lashay Lewis",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Ty Magnin",
    topics: ["bottom of funnel", "BoFu", "revenue", "conversion", "AI content", "demand generation"],
  },
  {
    title: "The 10x Content Engineer: Systems Over Tools | AirOps & Mike King",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Mike King",
    topics: ["content engineering", "systems", "AI tools", "content operations", "scale", "10x productivity"],
  },
  {
    title: "What You Need to Know About Google AI Mode | AirOps & Mark Williams-Cook",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Mark Williams-Cook",
    topics: ["Google AI Mode", "AI search", "Google updates", "SEO", "AI overviews", "search visibility"],
  },
  {
    title: "How to Refresh Content with AI Workflows | AirOps & Steve Toth",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Steve Toth",
    topics: ["content refresh", "AI workflows", "SEO", "content decay", "refresh automation", "content updates"],
  },
  {
    title: "AI Overview Impact on SEO | AirOps & Kevin Indig",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Kevin Indig",
    topics: ["AI overviews", "SEO", "Google", "traffic impact", "search visibility", "click-through rates"],
  },
  {
    title: "The AI Search Action Checklist | AirOps & Aleyda Solis",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Aleyda Solis",
    topics: ["AI search", "action checklist", "SEO", "AEO", "search optimization", "practical tactics"],
  },
  {
    title: "Query Fan-Out: What 60,000+ Searches from ChatGPT & Google Show | AirOps & Chris Long",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Chris Long",
    topics: ["query fan-out", "ChatGPT", "Google", "search data", "LLM queries", "search behavior", "research"],
  },
  {
    title: "How Top CMOs Are Winning AI Search | AirOps & Nicole Baer",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Nicole Baer",
    topics: ["CMO", "AI search", "leadership", "content strategy", "marketing leadership", "brand visibility"],
  },
  {
    title: "Google in Flux & Algo Updates: What's Next? | AirOps & Lily Ray",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Lily Ray",
    topics: ["Google algorithm", "algo updates", "SEO", "Google flux", "search changes", "EEAT"],
  },
  {
    title: "Create High-Performing B2B Content That Drives Conversions | AirOps & Andy Crestodina",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Andy Crestodina",
    topics: ["B2B content", "conversions", "content marketing", "high-performing content", "demand gen"],
  },
  {
    title: "The Dark SEO Funnel | AirOps & Gaetano DiNardi",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Gaetano DiNardi",
    topics: ["dark funnel", "SEO", "brand awareness", "demand generation", "attribution", "invisible pipeline"],
  },
  {
    title: "Why the Smartest CMOs Build Content Like a Product | MKT1 Emily Kramer & AirOps",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Emily Kramer",
    topics: ["CMO", "content as product", "content strategy", "marketing leadership", "product thinking", "MKT1"],
  },
  {
    title: "CMO Series: Finding Alpha - How We're Thinking About AI Search at Ramp | AirOps & George Bonaci",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "George Bonaci",
    topics: ["CMO", "AI search", "Ramp", "fintech", "content strategy", "alpha", "search investment"],
  },
  {
    title: "End of Year Recap and Bold Predictions | AirOps & Kevin Indig",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Kevin Indig",
    topics: ["predictions", "SEO trends", "AI search", "year in review", "future of search"],
  },
  {
    title: "Insight → Impact: How GTM Teams Deliver AI Search Results (with MCPs) | AirOps",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "AirOps team",
    topics: ["GTM", "MCP", "AI search results", "go-to-market", "content impact", "search ROI"],
  },
  {
    title: "Your 60-Day AI Visibility Sprint: The BOFU Playbook | AirOps & Lashay Lewis",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Lashay Lewis",
    topics: ["AI visibility", "60-day sprint", "BoFu", "playbook", "bottom of funnel", "conversion content"],
  },
  {
    title: "The Brand Flywheel: Authentic Content, Audience & Momentum | AirOps & Dave Gerhardt",
    url: "https://www.youtube.com/@AirOpsHQ",
    guest: "Dave Gerhardt",
    topics: ["brand flywheel", "authentic content", "audience building", "momentum", "brand marketing", "community"],
  },
];

export async function suggestCards(
  analysis: TranscriptAnalysis,
  guestName: string,
  currentVideoTitle: string
): Promise<CardSuggestion[]> {
  if (!analysis.core_themes.length) return [];

  const videoList = airOpsVideos
    .filter((v) => v.title !== currentVideoTitle)
    .map((v, i) => `${i + 1}. "${v.title}" — Guest: ${v.guest} — Topics: ${v.topics.join(", ")}`)
    .join("\n");

  const prompt = `
You are helping pick the best YouTube cards and end screens for a video based on its content.

The current video covers these themes:
- Core themes: ${analysis.core_themes.join(", ")}
- Strategic shifts: ${analysis.strategic_shifts.join(", ")}
- Key topics: ${analysis.commercial_intent.join(", ")}
- Guest: ${guestName}

Here are the available AirOps YouTube videos to choose from:
${videoList}

Pick the 2–3 best videos to suggest as YouTube cards or end screens. Prioritize:
1. Strong topic similarity
2. Guest match — if the same guest appears in another video
3. Complementary content the viewer would naturally want next

Return this exact JSON. No explanation. No markdown. JSON only.

{
  "suggestions": [
    {
      "videoIndex": 1,
      "reason": "1-sentence explanation of why this is a good next watch",
      "matchType": "topic"
    }
  ]
}

matchType must be one of: "topic", "guest", "both"
  `.trim();

  const result = await callClaude(prompt);
  const parsed = JSON.parse(result) as {
    suggestions: { videoIndex: number; reason: string; matchType: "topic" | "guest" | "both" }[]
  };

  const filteredVideos = airOpsVideos.filter((v) => v.title !== currentVideoTitle);

  return (parsed.suggestions ?? [])
    .slice(0, 3)
    .map((s) => ({
      video: filteredVideos[s.videoIndex - 1],
      reason: s.reason,
      matchType: s.matchType,
    }))
    .filter((s) => s.video != null);
}
