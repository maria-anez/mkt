import { callClaude } from "./claude";
import type { ClipMoment } from "./types";

export async function scoreClipsFromTranscript(
  transcript: string,
  guestName: string,
  videoType: string
): Promise<ClipMoment[]> {
  if (!transcript.trim()) return [];

  const prompt = `
You are a video editor and content strategist analyzing a transcript to find the best standalone clip moments.

Your job is to go through the entire transcript and identify the 5–10 moments that would make the strongest short-form video clips (30–90 seconds each).

Guest: ${guestName}
Video type: ${videoType}

WHAT MAKES A STRONG CLIP:
- A clear, self-contained insight that makes sense without watching the full video
- A reframe, revelation, or contrarian take that challenges how people think
- A tactical or data-backed point with immediate practical value
- A story or concrete example that illustrates a bigger idea
- Something the audience would pause, screenshot, or share on LinkedIn
- 30–90 seconds long (~65–195 words at average speaking pace)

WHAT TO AVOID:
- Transitions, housekeeping, or setup moments
- Moments that require heavy context from earlier in the video
- Generic statements without a specific insight or hook

FOR EACH MOMENT return timestampStart, timestampEnd, summary, rationale, insightType (reframe/tactical/data/revelation/contrarian/story), score 1-10.
Only return clips scoring 6+. Sort by score descending.

Return this exact JSON. No explanation. No markdown. JSON only.
{
  "clips": [
    {
      "timestampStart": "MM:SS",
      "timestampEnd": "MM:SS",
      "summary": "1-sentence description",
      "rationale": "1-2 sentences on why this makes a strong standalone clip",
      "insightType": "reframe",
      "score": 8
    }
  ]
}

Transcript:
${transcript.slice(0, 8000)}${transcript.length > 8000 ? "\n[transcript truncated]" : ""}
  `.trim();

  const result = await callClaude(prompt);
  const parsed = JSON.parse(result) as { clips: ClipMoment[] };
  return parsed.clips ?? [];
}
