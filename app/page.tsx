"use client";

import { useState } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import OutputPanel from "@/components/OutputPanel";
import type { FormData, GenerateResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);

  async function handleSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    setLastFormData(data);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const json = await res.json();
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    if (lastFormData) handleSubmit(lastFormData);
  }

  function handleClear() {
    setResult(null);
    setError(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--off-white)" }}>

      {/* ── Header — dark forest style ── */}
      <header
        style={{
          background: "var(--forest)",
          borderBottom: "1px solid #013a1a",
          padding: "0 32px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* AirOps wordmark */}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              color: "var(--off-white)",
              lineHeight: 1,
            }}
          >
            AirOps
          </span>
          <span
            style={{
              width: 1,
              height: 16,
              background: "#013a1a",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6aad88",
            }}
          >
            YouTube Generator
          </span>
        </div>

        <span className="pill pill-dark">
          Internal Tool
        </span>
      </header>

      {/* ── Two-column layout ── */}
      <div className="generator-layout">
        <div>
          <GeneratorForm onSubmit={handleSubmit} onClear={handleClear} loading={loading} />
        </div>
        <div>
          <OutputPanel
            result={result}
            loading={loading}
            error={error}
            onRegenerate={handleRegenerate}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
