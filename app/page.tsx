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
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--stroke-primary)",
          background: "var(--white)",
          padding: "0 24px",
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--near-black)",
          }}
        >
          YouTube Optimization Generator
        </span>
        <span className="pill">Powered by AirOps</span>
      </header>

      {/* Two-column layout */}
      <div className="generator-layout">
        {/* Left — Input */}
        <div>
          <GeneratorForm onSubmit={handleSubmit} onClear={handleClear} loading={loading} />
        </div>

        {/* Right — Output */}
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
