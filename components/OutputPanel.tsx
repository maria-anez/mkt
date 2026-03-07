"use client";

import type { GenerateResult } from "@/lib/types";

interface Props {
  result: GenerateResult | null;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onClear: () => void;
}

function CopyButton({ text }: { text: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(text);
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "3px 8px",
        border: "1px solid var(--stroke-primary)",
        background: "transparent",
        color: "var(--text-tertiary)",
        cursor: "pointer",
        borderRadius: 0,
      }}
    >
      Copy
    </button>
  );
}

function Section({
  label,
  children,
  copyText,
}: {
  label: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        {copyText && <CopyButton text={copyText} />}
      </div>
      {children}
    </div>
  );
}

const insightTypeColors: Record<string, string> = {
  reframe:     "#6366f1",
  tactical:    "#0ea5e9",
  data:        "#10b981",
  revelation:  "#f59e0b",
  contrarian:  "#ef4444",
  story:       "#8b5cf6",
};

const matchTypeColors: Record<string, string> = {
  topic: "#10b981",
  guest: "#6366f1",
  both:  "#f59e0b",
};

export default function OutputPanel({ result, loading, error, onRegenerate, onClear }: Props) {
  if (loading) {
    return (
      <div className="card" style={{ padding: 24, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
            Generating
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Reading transcript and building output…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>
        <button className="btn-primary" onClick={onRegenerate} style={{ fontSize: 13, padding: "8px 16px" }}>
          Try again
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 24, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
          Fill in the form and hit Generate to see your YouTube copy here.
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24 }}>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button className="btn-primary" onClick={onRegenerate} style={{ flex: 1, padding: "9px 0", fontSize: 13 }}>
          Regenerate
        </button>
        <button className="btn-ghost" onClick={onClear} style={{ flex: 1, padding: "9px 0", fontSize: 13 }}>
          Clear
        </button>
      </div>

      {/* Titles */}
      <Section label="Titles" copyText={result.titles.join("\n")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {result.titles.map((t, i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                background: "var(--off-white)",
                border: "1px solid var(--stroke-primary)",
                fontSize: 13,
                lineHeight: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span>{t}</span>
              <CopyButton text={t} />
            </div>
          ))}
        </div>
      </Section>

      {/* Description */}
      <Section
        label={`Description · ${result.descriptionCharCount} chars`}
        copyText={result.description}
      >
        <div
          style={{
            padding: "12px",
            background: "var(--off-white)",
            border: "1px solid var(--stroke-primary)",
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {result.description}
        </div>
      </Section>

      {/* Chapters */}
      {result.chapters && (
        <Section label="Chapters" copyText={result.chapters}>
          <div
            style={{
              padding: "12px",
              background: "var(--off-white)",
              border: "1px solid var(--stroke-primary)",
              fontSize: 13,
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-mono)",
            }}
          >
            {result.chapters}
          </div>
        </Section>
      )}

      {/* Pinned comment */}
      <Section label="Pinned comment" copyText={result.pinnedComment}>
        <div
          style={{
            padding: "12px",
            background: "var(--off-white)",
            border: "1px solid var(--stroke-primary)",
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {result.pinnedComment}
        </div>
      </Section>

      {/* Card & end screen suggestions */}
      {result.cardSuggestions && result.cardSuggestions.length > 0 && (
        <Section label="Cards & end screens">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.cardSuggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  background: "var(--off-white)",
                  border: "1px solid var(--stroke-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
                    {s.video?.title ?? "Unknown video"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      background: matchTypeColors[s.matchType] + "20",
                      color: matchTypeColors[s.matchType],
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {s.matchType}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {s.reason}
                </div>
                <a
                  href={s.video?.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none" }}
                >
                  View on YouTube ↗
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Clip recommendations — webinar only */}
      {result.clipMoments && result.clipMoments.length > 0 && (
        <Section label="Clip recommendations">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.clipMoments.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  background: "var(--off-white)",
                  border: "1px solid var(--stroke-primary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--near-black)",
                    }}
                  >
                    {c.timestampStart} – {c.timestampEnd}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        background: (insightTypeColors[c.insightType] ?? "#888") + "20",
                        color: insightTypeColors[c.insightType] ?? "#888",
                      }}
                    >
                      {c.insightType}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: c.score >= 9 ? "#10b981" : c.score >= 7 ? "#f59e0b" : "var(--text-tertiary)",
                      }}
                    >
                      {c.score}/10
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
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
