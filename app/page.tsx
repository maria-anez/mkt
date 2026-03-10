"use client";

import { useState, useEffect, useRef } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import OutputPanel from "@/components/OutputPanel";
import type { FormData, GenerateResult } from "@/lib/types";

type VideoType = "webinar" | "clip" | "short";

const RECENT_KEY = "airops_tube_recent";

interface RecentGeneration {
  id: string;
  title: string;
  videoType: string;
  guestName: string;
  timestamp: number;
  formData: FormData;
  result: GenerateResult;
}

function loadRecent(): RecentGeneration[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch { return []; }
}

function saveRecent(item: RecentGeneration) {
  try {
    const existing = loadRecent().filter(r => r.id !== item.id);
    localStorage.setItem(RECENT_KEY, JSON.stringify([item, ...existing].slice(0, 5)));
  } catch {}
}

function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

const NAV_ITEMS = [
  { type: "webinar" as VideoType, emoji: "🎙️", label: "Webinar", hint: "45–60 min" },
  { type: "clip"    as VideoType, emoji: "✂️",  label: "Clip",    hint: "2–5 min"  },
  { type: "short"   as VideoType, emoji: "⚡",  label: "Short",   hint: "30–90 sec" },
];

const POLL_INTERVAL = 3000;
const MAX_POLLS     = 30;

export default function Home() {
  const [result,       setResult]       = useState<GenerateResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [enriching,    setEnriching]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [lastFormData,    setLastFormData]    = useState<FormData | null>(null);
  const [activeType,      setActiveType]      = useState<VideoType>("webinar");
  const [fullTranscript,  setFullTranscript]  = useState("");
  const [prefillTranscript, setPrefillTranscript] = useState<string | undefined>(undefined);
  const [clipTimestamps, setClipTimestamps] = useState<{ start: string; end: string } | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);

  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const enrichPollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount      = useRef(0);
  const enrichPollCount = useRef(0);

  function stopPoll()        { if (pollRef.current)       clearInterval(pollRef.current); }
  function stopEnrichPoll()  { if (enrichPollRef.current)  clearInterval(enrichPollRef.current); }

  useEffect(() => () => { stopPoll(); stopEnrichPoll(); }, []);

  useEffect(() => {
    setRecentGenerations(loadRecent());
  }, []);

  async function pollStatus(executionId: string) {
    pollCount.current = 0;
    stopPoll();

    pollRef.current = setInterval(async () => {
      pollCount.current++;
      if (pollCount.current > MAX_POLLS) {
        stopPoll();
        setLoading(false);
        setError("Generation timed out — please try again");
        return;
      }

      try {
        const res  = await fetch(`/api/status?id=${executionId}`);
        const json = await res.json();

        if (json.status === "success") {
          stopPoll();
          setResult(json.result);
          setLoading(false);
          const recentItem: RecentGeneration = {
            id: Date.now().toString(),
            title: json.result.titles?.[0] ?? "Untitled",
            videoType: lastFormData?.videoType ?? "webinar",
            guestName: lastFormData?.guestName ?? "",
            timestamp: Date.now(),
            formData: lastFormData!,
            result: json.result,
          };
          saveRecent(recentItem);
          setRecentGenerations(loadRecent());
        } else if (json.status === "error") {
          stopPoll();
          setLoading(false);
          setError("Generation failed — please try again");
        }
        // "pending" — keep polling
      } catch {
        // network error — keep polling
      }
    }, POLL_INTERVAL);
  }

  async function pollEnrichStatus(executionId: string) {
    enrichPollCount.current = 0;
    stopEnrichPoll();

    enrichPollRef.current = setInterval(async () => {
      enrichPollCount.current++;
      if (enrichPollCount.current > MAX_POLLS) {
        stopEnrichPoll();
        setEnriching(false);
        return;
      }

      try {
        const res  = await fetch(`/api/enrich-status?id=${executionId}`);
        const json = await res.json();

        if (json.status === "success") {
          stopEnrichPoll();
          setEnriching(false);
          setResult(prev => prev ? {
            ...prev,
            clipMoments:     json.clipMoments     ?? prev.clipMoments,
            cardSuggestions: json.cardSuggestions  ?? prev.cardSuggestions,
            aeoMatches:      json.aeoMatches       ?? prev.aeoMatches,
          } : prev);
        } else if (json.status === "error") {
          stopEnrichPoll();
          setEnriching(false);
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL);
  }

  async function handleSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastFormData(data);
    setFullTranscript(data.transcript);
    stopPoll();
    stopEnrichPoll();

    try {
      const res  = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (json.error) throw new Error(json.error);
      if (!json.executionId) throw new Error("No execution ID returned");

      await pollStatus(json.executionId);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleEnrich() {
    if (!lastFormData) return;
    setEnriching(true);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType:    lastFormData.videoType,
          guestName:    lastFormData.guestName,
          guestRole:    lastFormData.guestRole ?? "",
          guestCompany: lastFormData.guestCompany ?? "",
          videoTitle:   lastFormData.videoTitle ?? "Untitled",
          recapUrl:     lastFormData.recapUrl || "none",
          takeaways:    "none",
          tonePreference: lastFormData.tonePreference,
          titleCount:   lastFormData.titleCount,
          transcript:   lastFormData.transcript.slice(0, 25000),
        }),
      });

      const json = await res.json();

      if (json.error) {
        console.error("[handleEnrich] error:", json.error);
        setEnriching(false);
        return;
      }

      setResult(prev => prev ? {
        ...prev,
        clipMoments:     json.clipMoments     ?? prev.clipMoments,
        cardSuggestions: json.cardSuggestions  ?? prev.cardSuggestions,
        aeoMatches:      json.aeoMatches       ?? prev.aeoMatches,
      } : prev);
    } catch (e) {
      console.error("[handleEnrich] failed:", e);
    } finally {
      setEnriching(false);
    }
  }

  function handleClipSelect(clipData: Partial<FormData> & { timestampStart?: string; timestampEnd?: string }) {
    if (!lastFormData) return;
    setActiveType((clipData.videoType as VideoType) ?? "clip");
    setPrefillTranscript(clipData.transcript);
    const { timestampStart, timestampEnd, ...formData } = clipData;
    if (timestampStart && timestampEnd) {
      setClipTimestamps({ start: timestampStart, end: timestampEnd });
    }
    handleSubmit({
      ...lastFormData,
      ...formData,
      takeaways: undefined,
      videoTitle: undefined,
      recapUrl: lastFormData.recapUrl,
    });
  }

  function handleClear() {
    setResult(null);
    setError(null);
    stopPoll();
    stopEnrichPoll();
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a6b4a" }}>
                Recent
              </div>
              {recentGenerations.length > 0 && (
                <button
                  onClick={() => { clearRecent(); setRecentGenerations([]); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3a6b4a" }}
                >
                  Clear all
                </button>
              )}
            </div>
            {recentGenerations.length === 0 ? (
              <div style={{ color: "#3a6b4a", fontSize: 12, fontFamily: "var(--font-sans)" }}>
                No recent generations yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recentGenerations.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setResult(r.result);
                      setLastFormData(r.formData);
                      setFullTranscript(r.formData.transcript);
                      setActiveType(r.formData.videoType as VideoType);
                    }}
                    style={{ padding: "8px 0", cursor: "pointer", borderBottom: "1px solid #0d3320" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#8ab89a", lineHeight: 1.3, marginBottom: 2 }}>
                      {r.title.length > 40 ? r.title.slice(0, 40) + "..." : r.title}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3a6b4a" }}>
                      {r.videoType} · {r.guestName.split(",")[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              prefillTranscript={prefillTranscript}
              clipTimestamps={clipTimestamps}
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
              fullTranscript={fullTranscript}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
