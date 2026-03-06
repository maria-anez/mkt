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
  videoTitle?: string;       // Required for webinars (official name); optional for clips/shorts
  primaryKeyword: string;
  guestName: string;
  guestRole: string;
  guestCompany: string;
  transcript: string;
  tonePreference: TonePreference;
  titleCount: number;
  recapUrl?: string;         // Webinar recap blog URL; falls back to {{WEBINAR_RECAP_URL}}
}

export interface TranscriptAnalysis {
  core_themes:       string[];
  strategic_shifts:  string[];
  authority_signals: string[];
  commercial_intent: string[];
  suggested_queries: string[];  // Natural-language AI search queries grounded in transcript
}

export interface AirOpsPrompt {
  name:          string;
  description:   string;
  citation_rate: number;    // 0–100; used to boost match scores
}

export interface GenerateResult {
  titles: string[];
  description: string;
  descriptionCharCount: number;
  chapters: string;
  pinnedComment: string;
}
