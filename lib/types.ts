export type VideoType = "short" | "long-form";

export type TonePreference =
  | "engagement"
  | "educational"
  | "analytical"
  | "bold-contrarian"
  | "conversational"
  | "executive-authority";

export interface FormData {
  videoTitle: string;
  videoType: VideoType;
  primaryKeyword: string;
  guestName: string;
  guestRole: string;
  guestCompany: string;
  transcript: string;
  keyTalkingPoints?: string;
  callToAction?: string;
  tonePreference: TonePreference;
}

export interface GenerateResult {
  description: string;
  characterCount: number;
}
