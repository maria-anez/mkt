"use client";

import { useState } from "react";
import type { GenerateResult } from "@/lib/types";

interface Props {
  result: GenerateResult | null;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onClear: () => void;
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
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Section({
  label,
  meta,
  children,
  copyText,
}: {
  label: string;
  meta?: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="section-label">{label}</span>
          {meta && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: "0.04em" }}>
              {meta}
            </span>
          )}
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

export default function OutputPanel({ result, loading, error, onRegenerate, onClear }: Props) {

  if (loading) {
    return (
      <div className="card" style={{ padding: 32, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--forest)", border: "1px solid #057a28", boxShadow: "inset 0 0 0 1px #013a1a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--off-white)", marginBottom: 10, lineHeight: 1 }}>
            Generating
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6aad88" }}>
            Reading transcript &amp; building output…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ef4444", marginBottom: 16 }}>
          {error}
        </div>
        <button className="btn-accent" onClick={onRegenerate} style={{ fontSize: 13 }}>Try again →</button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 32, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fffb", backgroundImage: "radial-gradient(var(--stroke-green) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--forest)", marginBottom: 8, lineHeight: 1 }}>
            Your output<br />lives here.
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 12 }}>
            Fill in the form and hit generate
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24 }}>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button className="btn-accent" onClick={onRegenerate} style={{ flex: 1, padding: "10px 0", fontSize: 13, borderRadius: 58 }}>
          Regenerate →
        </button>
        <button className="btn-ghost" onClick={onClear} style={{ padding: "10px 16px", fontSize: 10 }}>
          Clear
        </button>
      </div>

      {/* Titles */}
      <Section label="Titles" copyText={result.titles.join("\n")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {result.titles.map((t, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "var(--off-white)", border: "1px solid var(--stroke-green)", fontSize: 13, lineHeight: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: "var(--text-primary)" }}>{t}</span>
              <CopyButton text={t} />
            </div>
          ))}
        </div>
      </Section>

      {/* Description */}
      <Section label="Description" meta={`${result.descriptionCharCount} chars`} copyText={result.description}>
        <div style={{ padding: "14px", background: "var(--off-white)", border: "1px solid var(--stroke-green)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
          {result.description}
        </div>
      </Section>

      {/* Chapters */}
      {result.chapters && (
        <Section label="Chapters" copyText={result.chapters}>
          <div style={{ padding: "14px", background: "var(--off-white)", border: "1px solid var(--stroke-green)", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {result.chapters}
          </div>
        </Section>
      )}

      {/* Pinned comment */}
      <Section label="Pinned comment" copyText={result.pinnedComment}>
        <div style={{ padding: "14px", background: "var(--off-white)", border: "1px solid var(--stroke-green)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
          {result.pinnedComment}
        </div>
      </Section>

      {/* AEO moments */}
      {result.aeoMatches && result.aeoMatches.length > 0 && (
        <Section label="AEO moments">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.aeoMatches.map((m, i) => (
              <div key={i} style={{ padding: "12px", background: "var(--off-white)", border: "1px solid var(--stroke-green)" }}>
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

      {/* Cards & end screens — now with timestamps */}
      {result.cardSuggestions && result.cardSuggestions.length > 0 && (
        <Section label="Cards & end screens">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.cardSuggestions.map((s, i) => {
              const card = s as typeof s & { timestamp?: string; context?: string };
              return (
                <div key={i} style={{ padding: "12px", background: "var(--off-white)", border: "1px solid var(--stroke-green)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: "var(--text-primary)" }}>
                      {s.video?.title ?? "Unknown video"}
                    </span>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 6px", background: (matchColors[s.matchType] ?? "#888") + "18", color: matchColors[s.matchType] ?? "#888", border: `1px solid ${matchColors[s.matchType] ?? "#888"}40`, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {s.matchType}
                    </span>
                  </div>

                  {/* Timestamp recommendation */}
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
              <div key={i} style={{ padding: "12px", background: "var(--off-white)", border: "1px solid var(--stroke-green)" }}>
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
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {c.rationale}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
