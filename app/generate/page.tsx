"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GeneratorForm from "@/components/GeneratorForm";
import OutputSection from "@/components/OutputSection";
import type { FormData, GenerateResult } from "@/lib/types";

export default function GeneratePage() {
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
    <main style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--off-white)" }}>
      <Nav />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <span className="pill" style={{ marginBottom: 16, display: "inline-flex" }}>
            Generator
          </span>
          <h1
            className="headline"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, marginBottom: 12 }}
          >
            Generate your description.
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.55 }}>
            Fill in the details below. The more context you provide, the sharper the output.
          </p>
        </div>

        <GeneratorForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "#fff0f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <OutputSection
            result={result}
            onRegenerate={handleRegenerate}
            onClear={handleClear}
            loading={loading}
          />
        )}
      </div>

      <Footer />
    </main>
  );
}
