"use client";

import { useState } from "react";
import type { FormData, TonePreference, VideoType } from "@/lib/types";

interface Props {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--stroke-green)",
  borderRadius: 0,
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  color: "var(--text-primary)",
  background: "var(--white)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: "engagement", label: "Engagement (default)" },
  { value: "educational", label: "Educational" },
  { value: "analytical", label: "Analytical" },
  { value: "bold-contrarian", label: "Bold / Contrarian" },
  { value: "conversational", label: "Conversational" },
  { value: "executive-authority", label: "Executive / Authority" },
];

export default function GeneratorForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormData>({
    videoTitle: "",
    videoType: "long-form",
    primaryKeyword: "",
    guestName: "",
    guestRole: "",
    guestCompany: "",
    transcript: "",
    keyTalkingPoints: "",
    callToAction: "",
    tonePreference: "engagement",
  });

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const isValid =
    form.videoTitle.trim() &&
    form.primaryKeyword.trim() &&
    form.guestName.trim() &&
    form.transcript.trim();

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ background: "var(--white)", padding: 32 }}>
        {/* Required fields header */}
        <div style={{ marginBottom: 28 }}>
          <span className="pill">Required</span>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {/* Video Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Video title</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. How AEO Is Replacing SEO in 2025"
              value={form.videoTitle}
              onChange={(e) => set("videoTitle", e.target.value)}
              required
            />
          </div>

          {/* Video Type + Primary Keyword */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Video type</label>
              <select
                style={inputStyle}
                value={form.videoType}
                onChange={(e) => set("videoType", e.target.value as VideoType)}
              >
                <option value="short">Short</option>
                <option value="long-form">Long-form</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Primary keyword</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. answer engine optimization"
                value={form.primaryKeyword}
                onChange={(e) => set("primaryKeyword", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Guest info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Guest name</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Jane Smith"
                value={form.guestName}
                onChange={(e) => set("guestName", e.target.value)}
                required
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Guest role</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Head of Growth"
                value={form.guestRole}
                onChange={(e) => set("guestRole", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Guest company</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="AirOps"
                value={form.guestCompany}
                onChange={(e) => set("guestCompany", e.target.value)}
              />
            </div>
          </div>

          {/* Transcript */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Full transcript</label>
            <textarea
              style={{ ...inputStyle, minHeight: 180, resize: "vertical", lineHeight: 1.55 }}
              placeholder="Paste the full video transcript here..."
              value={form.transcript}
              onChange={(e) => set("transcript", e.target.value)}
              required
            />
          </div>
        </div>

        {/* Optional fields */}
        <div style={{ marginTop: 32, marginBottom: 20, borderTop: "1px solid var(--stroke-primary)", paddingTop: 28 }}>
          <span className="pill" style={{ background: "var(--green-200)" }}>Optional</span>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {/* Key Talking Points */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Key talking points</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.55 }}
              placeholder="List the key moments or topics you want highlighted..."
              value={form.keyTalkingPoints}
              onChange={(e) => set("keyTalkingPoints", e.target.value)}
            />
          </div>

          {/* CTA + Tone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Call to action</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Subscribe for weekly AEO insights"
                value={form.callToAction}
                onChange={(e) => set("callToAction", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Tone preference</label>
              <select
                style={inputStyle}
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
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 32 }}>
          <button
            type="submit"
            className="btn-accent"
            style={{ padding: "14px 32px", fontSize: 16, opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed" }}
            disabled={!isValid || loading}
          >
            {loading ? "Generating..." : "Generate description"}
          </button>
        </div>
      </div>
    </form>
  );
}
