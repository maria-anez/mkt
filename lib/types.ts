export type VideoType = "webinar" | "clip" | "short";

export type TonePreference =
  | "empowering"
  | "functional-data"
  | "collaborative"
  | "aspirational"
  | "witty-clever";

export interface FormData {
  videoType: VideoType;
  videoTitle?: string;
  primaryKeyword?: string;
  guestName: string;
  guestRole?: string;
  guestCompany?: string;
  transcript: string;
  tonePreference: TonePreference;
  titleCount: number;
  recapUrl?: string;
  takeaways?: string;
}

export interface TranscriptAnalysis {
  core_themes:       string[];
  strategic_shifts:  string[];
  authority_signals: string[];
  commercial_intent: string[];
  suggested_queries: string[];
}

export interface AirOpsPrompt {
  name:          string;
  description:   string;
  citation_rate: number;
}

export interface MatchedMoment {
  promptName: string;
  quote: string;
  approximateTimestamp: string;
  reasoning: string;
}

export interface AEOMatch {
  prompt: string;
  quote: string;
  timestamp: string;
  why: string;
}

export interface ClipMoment {
  timestampStart: string;
  timestampEnd: string;
  summary: string;
  rationale: string;
  insightType: "reframe" | "tactical" | "data" | "revelation" | "contrarian" | "story";
  score: number;
  suggestedTitle?: string;
  format?: string;
}

export interface YouTubeVideo {
  title: string;
  url: string;
  guest: string;
  topics: string[];
}

export interface CardSuggestion {
  video: YouTubeVideo;
  reason: string;
  matchType: "topic" | "guest" | "both";
}

export interface GenerateResult {
  titles: string[];
  description: string;
  descriptionCharCount: number;
  chapters: string;
  pinnedComment: string | string[];
  matchedMoments?: MatchedMoment[];
  clipMoments?: ClipMoment[];
  cardSuggestions?: CardSuggestion[];
  aeoMatches?: AEOMatch[];
}
