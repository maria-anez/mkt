"use client";

import { useState } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import OutputPanel from "@/components/OutputPanel";
import type { FormData, GenerateResult } from "@/lib/types";

type VideoType = "webinar" | "clip" | "short";

const NAV_ITEMS = [
  { type: "webinar" as VideoType, emoji: "🎙️", label: "Webinar", hint: "45–60 min" },
  { type: "clip" as VideoType,   emoji: "✂️",  label: "Clip",    hint: "2–5 min"  },
  { type: "short" as VideoType,  emoji: "⚡",  label: "Short",   hint: "30–90 sec" },
];

export default function Home() {
  const [result, setResult]             = useState<GenerateResult | null>(null);
  const [loading, setLoading]           = useState(false);
  const [enriching, setEnriching]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [activeType, setActiveType]     = useState<VideoType>("webinar");

  async function handleSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
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

  async function handleEnrich() {
    if (!lastFormData) return;
    setEnriching(true);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastFormData),
      });
      if (!res.ok) return;
      const json = await res.json();
      setResult(prev => prev ? {
        ...prev,
        clipMoments: json.clipMoments ?? prev.clipMoments,
        cardSuggestions: json.cardSuggestions ?? prev.cardSuggestions,
        aeoMatches: json.aeoMatches ?? prev.aeoMatches,
      } : prev);
    } catch (e) {
      console.warn("Enrichment failed:", e);
    } finally {
      setEnriching(false);
    }
  }

  function handleClipSelect(clipData: Partial<FormData>) {
    if (!lastFormData) return;
    const newData: FormData = { ...lastFormData, ...clipData };
    setActiveType((clipData.videoType as VideoType) ?? "clip");
    handleSubmit(newData);
  }

  function handleClear() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="app-shell">

      {/* Header */}
      <header style={{
        background: "#001208",
        borderBottom: "1px solid #0d3320",
        padding: "0 28px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400, letterSpacing: "-0.03em", color: "var(--off-white)", lineHeight: 1 }}>
            AirOps
          </span>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400, letterSpacing: "-0.03em", color: "var(--interaction)", lineHeight: 1 }}>
            Tube
          </span>
          <span style={{ width: 1, height: 14, background: "#1a4a2a", display: "inline-block", margin: "0 4px" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3a6b4a" }}>
            YouTube Copy Generator
          </span>
        </div>
        <span className="pill pill-dark">Internal Tool</span>
      </header>

      <div className="main-layout">

        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ padding: "0 20px 16px", borderBottom: "1px solid #0d3320", marginBottom: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a6b4a", marginBottom: 12 }}>
              Format
            </div>
            {NAV_ITEMS.map(item => (
              <div
                key={item.type}
                className={`sidebar-item ${activeType === item.type ? "active" : ""}`}
                onClick={() => setActiveType(item.type)}
              >
                <div className="sidebar-item-icon">
                  <span style={{ fontSize: 18 }}>{item.emoji}</span>
                </div>
                <div>
                  <div className="sidebar-item-text">{item.label}</div>
                  <div className="sidebar-item-hint">{item.hint}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "8px 20px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a6b4a", marginBottom: 12 }}>
              Recent
            </div>
            <div style={{ color: "#3a6b4a", fontSize: 12, fontFamily: "var(--font-sans)" }}>
              No recent generations yet.
            </div>
          </div>

          <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #0d3320" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "#3a6b4a", letterSpacing: "-0.01em", lineHeight: 1.4 }}>
              Good content<br />
              <span style={{ color: "var(--interaction)" }}>earns attention.</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="content-area">
          <div className="form-panel">
            <GeneratorForm
              onSubmit={handleSubmit}
              onClear={handleClear}
              loading={loading}
              activeType={activeType}
              onTypeChange={setActiveType}
            />
          </div>
          <div className="output-panel">
            <OutputPanel
              result={result}
              loading={loading}
              enriching={enriching}
              error={error}
              onRegenerate={() => lastFormData && handleSubmit(lastFormData)}
              onClear={handleClear}
              onEnrich={handleEnrich}
              onClipSelect={handleClipSelect}
              videoType={activeType}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
