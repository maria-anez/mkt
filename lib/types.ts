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
  coreThemes:        string[];
  commercialPhrases: string[];
  strategicShifts:   string[];
  authoritySignals:  string[];
}

export interface GenerateResult {
  titles: string[];
  description: string;
  descriptionCharCount: number;
  chapters: string;
  pinnedComment: string;
}
