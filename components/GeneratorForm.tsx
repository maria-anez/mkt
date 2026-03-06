"use client";

import { useState } from "react";
import type { FormData, TonePreference, VideoType } from "@/lib/types";

interface Props {
  onSubmit: (data: FormData) => void;
  onClear: () => void;
  loading: boolean;
}

const videoTypeOptions: { value: VideoType; label: string; hint: string }[] = [
  { value: "webinar", label: "Webinar",  hint: "45–60 min · landscape" },
  { value: "clip",    label: "Clip",     hint: "2–5 min · landscape"   },
  { value: "short",   label: "Short",    hint: "30–90 sec · portrait"  },
];

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: "engagement",          label: "Engagement (default)"  },
  { value: "educational",         label: "Educational"           },
  { value: "analytical",          label: "Analytical"            },
  { value: "bold-contrarian",     label: "Bold / Contrarian"     },
  { value: "conversational",      label: "Conversational"        },
  { value: "executive-authority", label: "Executive / Authority" },
];

const defaultForm: FormData = {
  videoType:        "clip",
  videoTitle:       "",
  primaryKeyword:   "",
  guestName:        "",
  guestRole:        "",
  guestCompany:     "",
  transcript:       "",
  tonePreference:   "engagement",
  titleCount:       5,
  recapUrl:         "",
  takeaways:        "",
};

export default function GeneratorForm({ onSubmit, onClear, loading }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  function handleRegenerate() {
    onSubmit(form);
  }

  function handleClear() {
    setForm(defaultForm);
    onClear();
  }

  const isWebinar = form.videoType === "webinar";

  const isValid =
    form.guestName.trim() &&
    form.transcript.trim() &&
    (!isWebinar || (form.videoTitle ?? "").trim()) &&
    (!isWebinar || (form.primaryKeyword ?? "").trim());

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: 24 }}>
        {/* Required */}
        <div style={{ marginBottom: 20 }}>
          <span className="pill">Required</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Video type */}
          <div>
            <label className="field-label">Video type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {videoTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("videoType", opt.value)}
                  style={{
                    padding: "10px 12px",
                    border: `1px solid ${form.videoType === opt.value ? "var(--near-black)" : "var(--stroke-green)"}`,
                    background: form.videoType === opt.value ? "var(--near-black)" : "var(--white)",
                    color: form.videoType === opt.value ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                    borderRadius: 0,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Official title — required for Webinar only */}
          {isWebinar && (
            <div>
              <label className="field-label">
                Official webinar title
                <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
                  — used exactly, not rewritten
                </span>
              </label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. The Dark SEO Funnel | AirOps & Gaetano DiNardi"
                value={form.videoTitle ?? ""}
                onChange={(e) => set("videoTitle", e.target.value)}
                required={isWebinar}
              />
            </div>
          )}

          {/* Primary keyword — required for Webinar only */}
          {isWebinar && (
            <div>
              <label className="field-label">Primary keyword</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. answer engine optimization"
                value={form.primaryKeyword ?? ""}
                onChange={(e) => set("primaryKeyword", e.target.value)}
                required={isWebinar}
              />
            </div>
          )}

          {/* Guest info */}
          <div>
            <label className="field-label">Guest name</label>
            <input
              className="field-input"
              type="text"
              placeholder="Jane Smith"
              value={form.guestName}
              onChange={(e) => set("guestName", e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">Guest role</label>
              <input
                className="field-input"
                type="text"
                placeholder="VP of Growth"
                value={form.guestRole}
                onChange={(e) => set("guestRole", e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">
                Guest company
                <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
                  — optional
                </span>
              </label>
              <input
                className="field-input"
                type="text"
                placeholder="leave blank if freelancer"
                value={form.guestCompany ?? ""}
                onChange={(e) => set("guestCompany", e.target.value)}
              />
            </div>
          </div>

          {/* Transcript */}
          <div>
            <label className="field-label">Full transcript</label>
            <textarea
              className="field-input"
              style={{ minHeight: 220, resize: "vertical", lineHeight: 1.6 }}
              placeholder="Paste the full video transcript here..."
              value={form.transcript}
              onChange={(e) => set("transcript", e.target.value)}
              required
            />
          </div>
        </div>

        {/* Optional */}
        <div
          style={{
            borderTop: "1px solid var(--stroke-primary)",
            marginTop: 24,
            paddingTop: 20,
            marginBottom: 16,
          }}
        >
          <span className="pill pill-green">Optional</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="field-label">Tone</label>
            <select
              className="field-input"
              value={form.tonePreference}
              onChange={(e) => set("tonePreference", e.target.value as TonePreference)}
            >
              {toneOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {/* Title count only relevant for Clip / Short */}
          {!isWebinar && (
            <div>
              <label className="field-label">Title variations</label>
              <input
                className="field-input"
                type="number"
                min={1}
                max={10}
                value={form.titleCount}
                onChange={(e) => set("titleCount", Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="field-label">
            Recap blog URL
            <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
              — used in CTA; defaults to {"{{WEBINAR_RECAP_URL}}"} if blank
            </span>
          </label>
          <input
            className="field-input"
            type="url"
            placeholder="https://www.airops.com/blog/webinar-recap-..."
            value={form.recapUrl ?? ""}
            onChange={(e) => set("recapUrl", e.target.value)}
          />
        </div>

        {isWebinar && (
          <div style={{ marginTop: 12 }}>
            <label className="field-label">
              Takeaways
              <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
                — paste yours to keep consistent across publications; leave blank to auto-generate
              </span>
            </label>
            <textarea
              className="field-input"
              style={{ minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
              placeholder="e.g. • AI search is reshaping how buyers discover tools"
              value={form.takeaways ?? ""}
              onChange={(e) => set("takeaways", e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 24 }}>
          <button
            type="submit"
            className="btn-accent"
            style={{ width: "100%", padding: "12px 0", fontSize: 15 }}
            disabled={!isValid || loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1, padding: "10px 0", fontSize: 14 }}
              onClick={handleRegenerate}
              disabled={!isValid || loading}
            >
              Regenerate
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1, padding: "10px 0", fontSize: 14 }}
              onClick={handleClear}
              disabled={loading}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
