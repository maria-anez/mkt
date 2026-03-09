"use client";

import { useState, useEffect } from "react";
import type { GenerateResult, FormData } from "@/lib/types";

interface Props {
  result: GenerateResult | null;
  loading: boolean;
  enriching: boolean;
  error: string | null;
  onRegenerate: () => void;
  onClear: () => void;
  onEnrich: () => void;
  onClipSelect: (data: Partial<FormData>) => void;
  videoType: string;
  fullTranscript?: string;
}

const LOADING_MESSAGES = [
  "Reading your transcript... 📖",
  "Finding the real story in here... 🔍",
  "Cooking up chapters... 🍳",
  "Polishing the description... ✨",
  "Making the title sing... 🎵",
  "Almost there, this one's worth the wait... ⚡",
  "Checking AirOps brand rules... 📋",
  "Writing the pinned comment... 💬",
];

const ENRICH_MESSAGES = [
  "Hunting for clip gold... 🎬",
  "Asking the AEO gods... 🙏",
  "Matching to AirOps target prompts... 🎯",
  "Finding your best shorts... ⚡",
  "Suggesting YouTube cards... 🃏",
  "Almost done, finding the gems... 💎",
];

function useRotatingMessage(messages: string[], active: boolean, interval = 2500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) { setIndex(0); return; }
    const t = setInterval(() => setIndex(i => (i + 1) % messages.length), interval);
    return () => clearInterval(t);
  }, [active, messages.length, interval]);
  return messages[index];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={handleCopy} className={`btn-ghost ${copied ? "copied" : ""}`}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function Section({ label, meta, children, copyText }: { label: string; meta?: string; children: React.ReactNode; copyText?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="section-label">{label}</span>
          {meta && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>{meta}</span>}
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>
      {children}
    </div>
  );
}

const matchColors: Record<string, string> = {
  topic: "#008c44",
  guest: "#6366f1",
  both:  "#f59e0b",
};

export default function OutputPanel({ result, loading, enriching, error, onRegenerate, onClear, onEnrich, onClipSelect, videoType, fullTranscript }: Props) {
  const loadingMsg   = useRotatingMessage(LOADING_MESSAGES, loading);
  const enrichingMsg = useRotatingMessage(ENRICH_MESSAGES, enriching);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 24 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "3px solid var(--stroke-green)",
          borderTopColor: "var(--interaction)",
          animation: "spin 1s linear infinite",
        }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--forest)", lineHeight: 1, marginBottom: 12 }}>
            Generating
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-secondary)", minHeight: 24, transition: "all 0.3s" }}>
            {loadingMsg}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8,
              borderRadius: "50%",
              background: "var(--green-500)",
              animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--forest)", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Something went wrong
        </div>
        <div style={{ fontSize: 13, color: "#ef4444", marginBottom: 16, fontFamily: "var(--font-mono)" }}>{error}</div>
        <button className="btn-accent" onClick={onRegenerate}>Try again →</button>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
        <div style={{
          width: 80, height: 80,
          border: "2px solid var(--stroke-green)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          background: "var(--green-50)",
        }}>
          🎬
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--forest)", lineHeight: 1, marginBottom: 8 }}>
            Your output<br />lives here.
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            Fill in the form and hit Generate ✦
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button className="btn-accent" onClick={onRegenerate} style={{ flex: 1, padding: "10px 0", fontSize: 13, borderRadius: 58 }}>
          Regenerate →
        </button>
        <button className="btn-ghost" onClick={onClear} style={{ padding: "10px 16px" }}>
          Clear
        </button>
      </div>

      {/* Titles */}
      <Section label="Titles" copyText={result.titles.join("\n")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {result.titles.map((t, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "var(--white)", border: "1px solid var(--stroke-green)", fontSize: 13, lineHeight: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{t}</span>
              <CopyButton text={t} />
            </div>
          ))}
        </div>
      </Section>

      {/* Description */}
      <Section label="Description" meta={`${result.descriptionCharCount} chars`} copyText={result.description}>
        <div style={{ padding: "14px", background: "var(--white)", border: "1px solid var(--stroke-green)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
          {result.description}
        </div>
      </Section>

      {/* Chapters */}
      {result.chapters && (
        <Section label="Chapters" copyText={result.chapters}>
          <div style={{ padding: "14px", background: "var(--white)", border: "1px solid var(--stroke-green)", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {result.chapters}
          </div>
        </Section>
      )}

      {/* Pinned comment */}
      <Section label="Pinned comment" copyText={result.pinnedComment}>
        <div style={{ padding: "14px", background: "var(--white)", border: "1px solid var(--stroke-green)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
          {result.pinnedComment}
        </div>
      </Section>

      {/* Step 2 — Enrich button */}
      {!result.clipMoments?.length && !result.cardSuggestions?.length && !result.aeoMatches?.length && videoType === "webinar" && (
        <div style={{ padding: "20px", background: "var(--forest)", border: "1px solid var(--stroke-dark)", marginBottom: 20 }}>
          {enriching ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-on-dark)", marginBottom: 12 }}>
                {enrichingMsg}
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--interaction)", animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--off-white)", marginBottom: 4 }}>
                  Find clips, cards & AEO moments
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3a6b4a" }}>
                  Takes ~30 seconds · runs deeper analysis
                </div>
              </div>
              <button className="btn-enrich" onClick={onEnrich}>
                ✦ Analyze
              </button>
            </div>
          )}
        </div>
      )}

      {/* AEO moments — hidden from UI, data feeds into clip scoring */}
      {false && result.aeoMatches && result.aeoMatches.length > 0 && (
        <Section label="AEO moments">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.aeoMatches.map((m, i) => (
              <div key={i} style={{ padding: "12px", background: "var(--white)", border: "1px solid var(--stroke-green)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--forest)", background: "var(--accent-label)", padding: "2px 6px", border: "1px solid var(--stroke-green)" }}>
                    {m.timestamp}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--green-500)", marginBottom: 6, letterSpacing: "0.02em" }}>
                  {m.prompt}
                </div>
                <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6, borderLeft: "2px solid var(--stroke-green)", paddingLeft: 10 }}>
                  "{m.quote}"
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
                  {m.why}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Cards & end screens */}
      {result.cardSuggestions && result.cardSuggestions.length > 0 && (
        <Section label="Cards & end screens">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.cardSuggestions.map((s, i) => {
              const card = s as typeof s & { timestamp?: string; context?: string };
              return (
                <div key={i} style={{ padding: "12px", background: "var(--white)", border: "1px solid var(--stroke-green)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: "var(--text-primary)" }}>
                      {s.video?.title ?? "Unknown video"}
                    </span>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 6px", background: (matchColors[s.matchType] ?? "#888") + "18", color: matchColors[s.matchType] ?? "#888", border: `1px solid ${matchColors[s.matchType] ?? "#888"}40`, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {s.matchType}
                    </span>
                  </div>
                  {card.timestamp && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--forest)", background: "var(--accent-label)", padding: "2px 6px", border: "1px solid var(--stroke-green)" }}>
                        Add at {card.timestamp}
                      </span>
                      {card.context && (
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic" }}>
                          — {card.context}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
                    {s.reason}
                  </div>
                  <a href={s.video?.url ?? "#"} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "var(--green-500)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textDecoration: "none", textTransform: "uppercase" }}>
                    View on YouTube ↗
                  </a>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Clip recommendations */}
      {result.clipMoments && result.clipMoments.length > 0 && (
        <Section label="Clip recommendations">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.clipMoments.map((c, i) => (
              <div key={i} style={{ padding: "12px", background: "var(--white)", border: "1px solid var(--stroke-green)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--forest)", background: "var(--green-200)", padding: "2px 8px", border: "1px solid var(--stroke-green)" }}>
                      {c.timestampStart} – {c.timestampEnd}
                    </span>
                    {c.format && (
                      <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 6px", background: c.format === "short" ? "#8b5cf618" : "#0ea5e918", color: c.format === "short" ? "#8b5cf6" : "#0ea5e9", border: `1px solid ${c.format === "short" ? "#8b5cf640" : "#0ea5e940"}` }}>
                        {c.format}
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: c.score >= 9 ? "var(--green-500)" : c.score >= 7 ? "#f59e0b" : "var(--text-tertiary)" }}>
                    {c.score}/10
                  </span>
                </div>
                {c.suggestedTitle && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
                    → {c.suggestedTitle}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 4, color: "var(--text-primary)" }}>
                  {c.summary}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
                  {c.rationale}
                </div>

                {/* Create clip/short copy button */}
                <button
                  onClick={() => {
                    console.log("[clip] fullTranscript first 200 chars:", (fullTranscript ?? "").slice(0, 200));
                    console.log("[clip] isVTT:", (fullTranscript ?? "").includes("WEBVTT"));
                    console.log("[clip] clipTranscript length will be:", (fullTranscript ?? "").split(/\s+/).length, "words");
                    const transcript = fullTranscript ?? "";
                    const parseTime = (ts: string) => ts.split(":").reduce((acc: number, t: string) => acc * 60 + parseInt(t), 0);
                    const startSec = parseTime(c.timestampStart);
                    const endSec = parseTime(c.timestampEnd);
                    const bufferSec = 30;
                    const extractStart = Math.max(0, startSec - bufferSec);
                    const extractEnd = endSec + bufferSec;

                    const lines = transcript.split("\n");
                    const isVTT = transcript.includes("WEBVTT") || lines.some(l => l.match(/^\d{2}:\d{2}:\d{2}/));
                    let clipTranscript = "";

                    if (isVTT) {
                      let currentTime = 0;
                      let capturing = false;
                      const capturedLines: string[] = [];
                      for (const line of lines) {
                        const timeMatch = line.match(/^(\d{2}):(\d{2}):(\d{2})/);
                        if (timeMatch) {
                          currentTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
                          capturing = currentTime >= extractStart && currentTime <= extractEnd;
                          continue;
                        }
                        if (line.match(/^WEBVTT/) || line.match(/^\d+$/) || line.trim() === "") continue;
                        if (capturing) capturedLines.push(line.trim());
                      }
                      clipTranscript = capturedLines.join(" ");
                    }

                    if (!clipTranscript) {
                      const cleanTranscript = lines
                        .filter(line => !line.match(/^\d{2}:\d{2}/) && !line.match(/^WEBVTT/) && !line.match(/^\d+$/) && line.trim() !== "")
                        .join(" ");
                      const words = cleanTranscript.split(/\s+/);
                      const startWord = Math.floor(startSec * 130 / 60);
                      const endWord = Math.ceil(endSec * 130 / 60);
                      clipTranscript = words.slice(Math.max(0, startWord - 20), endWord + 20).join(" ");
                    }

                    onClipSelect({
                      videoType: (c.format === "short" ? "short" : "clip") as "clip" | "short",
                      transcript: clipTranscript || c.summary,
                      takeaways: undefined,
                      recapUrl: undefined,
                      timestampStart: c.timestampStart,
                      timestampEnd: c.timestampEnd,
                    } as Partial<FormData> & { timestampStart?: string; timestampEnd?: string });
                  }}
                  style={{
                    background: "var(--forest)",
                    color: "var(--interaction)",
                    border: "1px solid var(--stroke-dark)",
                    padding: "6px 12px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-mid)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--forest)")}
                >
                  ✦ Create {c.format === "short" ? "short" : "clip"} copy →
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
