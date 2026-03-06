"use client";

import { useState } from "react";
import type { FormData, TonePreference, VideoType } from "@/lib/types";

interface Props {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: "engagement", label: "Engagement (default)" },
  { value: "educational", label: "Educational" },
  { value: "analytical", label: "Analytical" },
  { value: "bold-contrarian", label: "Bold / Contrarian" },
  { value: "conversational", label: "Conversational" },
  { value: "executive-authority", label: "Executive / Authority" },
];

const defaultForm: FormData = {
  primaryKeyword: "",
  videoType: "long-form",
  guestName: "",
  guestRole: "",
  guestCompany: "",
  transcript: "",
  tonePreference: "engagement",
  titleCount: 5,
};

export default function GeneratorForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const isValid =
    form.primaryKeyword.trim() &&
    form.guestName.trim() &&
    form.transcript.trim();

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: 24 }}>
        {/* Required */}
        <div style={{ marginBottom: 20 }}>
          <span className="pill">Required</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Primary keyword + Video Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">Primary keyword</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. answer engine optimization"
                value={form.primaryKeyword}
                onChange={(e) => set("primaryKeyword", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Video type</label>
              <select
                className="field-input"
                value={form.videoType}
                onChange={(e) => set("videoType", e.target.value as VideoType)}
              >
                <option value="long-form">Long-form</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

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
                placeholder="Head of Growth"
                value={form.guestRole}
                onChange={(e) => set("guestRole", e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Guest company</label>
              <input
                className="field-input"
                type="text"
                placeholder="AirOps"
                value={form.guestCompany}
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
        </div>

        {/* Submit */}
        <div style={{ marginTop: 24 }}>
          <button
            type="submit"
            className="btn-accent"
            style={{ width: "100%", padding: "12px 0", fontSize: 15 }}
            disabled={!isValid || loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </form>
  );
}
