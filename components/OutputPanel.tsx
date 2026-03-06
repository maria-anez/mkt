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

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className={`btn-ghost${copied ? " copied" : ""}`}
      onClick={handleCopy}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function SectionHeader({
  label,
  copyText,
}: {
  label: string;
  copyText: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <span className="pill">{label}</span>
      <CopyButton text={copyText} />
    </div>
  );
}

function LoadingShimmer() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[80, 60, 100, 55, 70].map((w, i) => (
          <div
            key={i}
            className="shimmer"
            style={{ height: 14, width: `${w}%` }}
          />
        ))}
        <div style={{ height: 24 }} />
        {[100, 90, 95, 85, 100, 80].map((w, i) => (
          <div
            key={i}
            className="shimmer"
            style={{ height: 13, width: `${w}%` }}
          />
        ))}
        <div style={{ height: 24 }} />
        {[55, 50, 60, 45, 55].map((w, i) => (
          <div
            key={i}
            className="shimmer"
            style={{ height: 13, width: `${w}%` }}
          />
        ))}
        <div style={{ height: 24 }} />
        {[100, 90, 70, 85].map((w, i) => (
          <div
            key={i}
            className="shimmer"
            style={{ height: 13, width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="card"
      style={{
        padding: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight: 320,
        background: "var(--white)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          textAlign: "center",
        }}
      >
        Output will appear here
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--text-tertiary)",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: 260,
        }}
      >
        Fill in the form and click Generate to see your titles, description,
        chapters, and pinned comment.
      </div>
    </div>
  );
}

export default function OutputPanel({
  result,
  loading,
  error,
  onRegenerate,
  onClear,
}: Props) {
  if (loading) return <LoadingShimmer />;
  if (!result && !error) return <EmptyState />;

  if (error) {
    return (
      <div
        className="card"
        style={{
          padding: 20,
          background: "#fff8f8",
          border: "1px solid #fca5a5",
          color: "#b91c1c",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
        }}
      >
        {error}
      </div>
    );
  }

  if (!result) return null;

  const titlesText = result.titles
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n");

  const allText = `=== TITLE OPTIONS ===\n${titlesText}\n\n=== DESCRIPTION ===\n${result.description}\n\n=== CHAPTERS ===\n${result.chapters}\n\n=== PINNED COMMENT ===\n${result.pinnedComment}`;

  const contentStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    lineHeight: 1.65,
    color: "var(--text-primary)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const monoStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    lineHeight: 1.8,
    color: "var(--text-primary)",
    whiteSpace: "pre-wrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Top action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <CopyButton text={allText} label="Copy all" />
        <button
          className="btn-ghost"
          onClick={onRegenerate}
        >
          Regenerate
        </button>
        <button
          className="btn-ghost"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      {/* ── Title Options ── */}
      <div className="card" style={{ padding: 20, marginBottom: 12 }}>
        <SectionHeader label="Title options" copyText={titlesText} />
        <ol
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {result.titles.map((title, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: "var(--text-tertiary)",
                  paddingTop: 2,
                  minWidth: 16,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>
                {title}
              </span>
              <CopyButton text={title} />
            </li>
          ))}
        </ol>
      </div>

      {/* ── Description ── */}
      <div className="card" style={{ padding: 20, marginBottom: 12 }}>
        <SectionHeader label="Description" copyText={result.description} />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-tertiary)",
              letterSpacing: "0.06em",
            }}
          >
            {result.descriptionCharCount} characters
          </span>
        </div>
        <div style={contentStyle}>{result.description}</div>
      </div>

      {/* ── Chapters ── */}
      <div className="card" style={{ padding: 20, marginBottom: 12 }}>
        <SectionHeader label="Chapters" copyText={result.chapters} />
        <div style={monoStyle}>{result.chapters}</div>
      </div>

      {/* ── Pinned Comment ── */}
      <div className="card" style={{ padding: 20 }}>
        <SectionHeader label="Pinned comment" copyText={result.pinnedComment} />
        <div style={contentStyle}>{result.pinnedComment}</div>
      </div>
    </div>
  );
}
