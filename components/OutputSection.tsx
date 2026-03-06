"use client";

import { useState } from "react";
import type { GenerateResult } from "@/lib/types";

interface Props {
  result: GenerateResult;
  onRegenerate: () => void;
  onClear: () => void;
  loading: boolean;
}

export default function OutputSection({ result, onRegenerate, onClear, loading }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(result.description).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <span className="pill" style={{ background: "var(--interaction)" }}>Output</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          {result.characterCount} characters
        </span>
      </div>

      <div
        className="card"
        style={{
          background: "var(--white)",
          padding: 28,
          marginBottom: 16,
          whiteSpace: "pre-wrap",
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--text-primary)",
          minHeight: 120,
        }}
      >
        {result.description}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          className="btn-primary"
          onClick={handleCopy}
          style={{ padding: "10px 22px", fontSize: 14 }}
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <button
          className="btn-secondary"
          onClick={onRegenerate}
          disabled={loading}
          style={{ padding: "10px 22px", fontSize: 14, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
        <button
          onClick={onClear}
          style={{
            padding: "10px 22px",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
