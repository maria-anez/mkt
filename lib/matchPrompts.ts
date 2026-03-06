import type { AirOpsPrompt } from "./types";

// ─── Local AirOps Prompt Database ────────────────────────────────────────────
// Representative set of AirOps visibility prompts used for query alignment.
// citation_rate is 0–100 and used to boost match scores.

export const localAirOpsPrompts: AirOpsPrompt[] = [
  {
    name: "AI Citation Optimization",
    description:
      "Optimize content structure and authority signals to increase citation likelihood in ChatGPT, Perplexity, and Gemini responses. Covers semantic heading structure, opening sentence authority, and FAQ schema.",
    citation_rate: 91,
  },
  {
    name: "Brand Mention Visibility in LLMs",
    description:
      "Strategies for getting a brand consistently mentioned in large language model outputs. Focuses on off-site signals, community participation, and third-party reference building.",
    citation_rate: 87,
  },
  {
    name: "AEO Content Strategy",
    description:
      "Answer Engine Optimization content planning framework. Covers query modeling, content depth requirements, and alignment between content intent and AI retrieval patterns.",
    citation_rate: 89,
  },
  {
    name: "AI Search Visibility Audit",
    description:
      "Audit framework for measuring how often a brand or domain surfaces in AI-generated answers. Tracks citation frequency, query coverage, and mention sentiment across AI tools.",
    citation_rate: 85,
  },
  {
    name: "Zero-Click Search Content Framework",
    description:
      "Content strategy for maintaining visibility and authority when traditional click-through rates decline due to AI Overviews and zero-click search results.",
    citation_rate: 83,
  },
  {
    name: "Reddit and Community Signal Optimization",
    description:
      "Tactical playbook for using Reddit threads, forum participation, and community-generated content to influence AI model citations and brand perception in LLM outputs.",
    citation_rate: 78,
  },
  {
    name: "Content Engineering for AI Retrieval",
    description:
      "Systematic approach to engineering content that ranks in both traditional search and AI-generated answers. Covers structure, depth, freshness, and authority layering.",
    citation_rate: 88,
  },
  {
    name: "B2B Brand Authority in AI Search",
    description:
      "Framework for B2B companies to build measurable authority in AI search results. Focuses on thought leadership content, analyst citations, and evaluation-stage visibility.",
    citation_rate: 82,
  },
  {
    name: "LLM Query Modeling for Content Teams",
    description:
      "Methodology for identifying the natural-language queries AI users submit that are relevant to your brand, product, or category, and aligning content production to match.",
    citation_rate: 86,
  },
  {
    name: "Perplexity and ChatGPT Citation Tactics",
    description:
      "Specific tactics for increasing citation frequency in Perplexity and ChatGPT. Covers source credibility signals, content freshness, and structured answer formatting.",
    citation_rate: 84,
  },
  {
    name: "Dark Funnel Visibility Strategy",
    description:
      "Strategy for capturing demand and building brand awareness in channels that don't generate trackable clicks — AI answers, social DMs, community threads, and peer recommendations.",
    citation_rate: 80,
  },
  {
    name: "Content Compounding and Flywheel",
    description:
      "Framework for building compounding content assets where each piece amplifies the visibility and authority of others, creating long-term organic and AI search momentum.",
    citation_rate: 76,
  },
  {
    name: "Organic Growth Without Paid Media",
    description:
      "Playbook for building sustainable organic growth through content, community, and authority building — without dependence on paid acquisition channels.",
    citation_rate: 72,
  },
  {
    name: "AI Overview Optimization",
    description:
      "Techniques for appearing in Google's AI Overviews. Covers structured data, entity authority, content conciseness, and alignment with featured snippet best practices.",
    citation_rate: 81,
  },
  {
    name: "Evaluation-Stage Content Design",
    description:
      "Content framework for capturing buyers at the evaluation stage — comparison pages, use-case specificity, third-party validation, and decision-stage query targeting.",
    citation_rate: 79,
  },
];

// ─── Tokenization Helpers ─────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "can", "how", "what", "when",
  "where", "who", "which", "that", "this", "these", "those", "i", "my",
  "your", "we", "our", "they", "their", "it", "its", "not", "no",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

/** Extract consecutive word pairs (bigrams) from a string. */
function bigrams(text: string): string[] {
  const words = tokenize(text);
  const result: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    result.push(`${words[i]} ${words[i + 1]}`);
  }
  return result;
}

/** Extract consecutive word triples (trigrams) from a string. */
function trigrams(text: string): string[] {
  const words = tokenize(text);
  const result: string[] = [];
  for (let i = 0; i < words.length - 2; i++) {
    result.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return result;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scorePromptAgainstQueries(
  prompt: AirOpsPrompt,
  queries: string[]
): number {
  const promptText = `${prompt.name} ${prompt.description}`.toLowerCase();
  const promptTokens = new Set(tokenize(promptText));
  const promptBigrams = new Set(bigrams(promptText));
  const promptTrigrams = new Set(trigrams(promptText));

  let rawScore = 0;

  for (const query of queries) {
    // Unigram overlap
    for (const token of tokenize(query)) {
      if (promptTokens.has(token)) rawScore += 1;
    }

    // Bigram phrase match (higher weight — indicates semantic alignment)
    for (const bg of bigrams(query)) {
      if (promptBigrams.has(bg)) rawScore += 2;
    }

    // Trigram phrase match (strongest signal)
    for (const tg of trigrams(query)) {
      if (promptTrigrams.has(tg)) rawScore += 4;
    }

    // Substring match for longer phrases (catches partial containment)
    const queryLower = query.toLowerCase();
    if (promptText.includes(queryLower.slice(0, 30))) rawScore += 1;
  }

  // Boost by citation_rate: high-performing prompts get a proportional lift
  return rawScore * (1 + prompt.citation_rate / 100);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MatchedPrompt {
  prompt:  AirOpsPrompt;
  score:   number;
  reason:  string;
}

/**
 * Scores each AirOps prompt against suggested queries extracted from the
 * transcript analysis. Returns the top 3 matches above a minimum threshold.
 * Returns an empty array if no strong alignment is found — never forces a match.
 */
export function matchPromptsFromQueries(
  suggestedQueries: string[],
  prompts: AirOpsPrompt[]
): MatchedPrompt[] {
  if (!suggestedQueries.length || !prompts.length) return [];

  const MIN_SCORE = 3; // minimum raw×boosted score to be considered a match

  const scored = prompts
    .map((prompt) => {
      const score = scorePromptAgainstQueries(prompt, suggestedQueries);

      // Build a short reason string from the best-matching query
      const bestQuery = suggestedQueries.reduce((best, q) => {
        const s = scorePromptAgainstQueries(prompt, [q]);
        const bs = scorePromptAgainstQueries(prompt, [best]);
        return s > bs ? q : best;
      }, suggestedQueries[0]);

      const reason = score >= MIN_SCORE
        ? `Aligned with query: "${bestQuery}"`
        : "";

      return { prompt, score, reason };
    })
    .filter((m) => m.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored;
}
