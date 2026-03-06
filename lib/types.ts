export type VideoType = "short" | "long-form";

export type TonePreference =
  | "engagement"
  | "educational"
  | "analytical"
  | "bold-contrarian"
  | "conversational"
  | "executive-authority";

export interface FormData {
  primaryKeyword: string;
  videoType: VideoType;
  guestName: string;
  guestRole: string;
  guestCompany: string;
  transcript: string;
  tonePreference: TonePreference;
  titleCount: number;
}

export interface GenerateResult {
  titles: string[];
  description: string;
  descriptionCharCount: number;
  chapters: string;
  pinnedComment: string;
}
