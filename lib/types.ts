export type VideoType = "webinar" | "clip" | "short";

export type TonePreference =
  | "engagement"
  | "educational"
  | "analytical"
  | "bold-contrarian"
  | "conversational"
  | "executive-authority";

export interface FormData {
  videoType: VideoType;
  videoTitle?: string;
  primaryKeyword: string;
  guestName: string;
  guestRole: string;
  guestCompany: string;
  transcript: string;
  tonePreference: TonePreference;
  titleCount: number;
  recapUrl?: string;
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

export interface GenerateResult {
  titles: string[];
  description: string;
  descriptionCharCount: number;
  chapters: string;
  pinnedComment: string;
  matchedMoments?: MatchedMoment[];
}
