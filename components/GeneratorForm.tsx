"use client";

import { useState } from "react";
import type { FormData, TonePreference, VideoType } from "@/lib/types";

interface Props {
  onSubmit: (data: FormData) => void;
  onClear: () => void;
  loading: boolean;
}

interface Guest {
  name: string;
  role: string;
  company: string;
}

const videoTypeOptions: { value: VideoType; label: string; hint: string }[] = [
  { value: "webinar", label: "Webinar",  hint: "45–60 min · landscape" },
  { value: "clip",    label: "Clip",     hint: "2–5 min · landscape"   },
  { value: "short",   label: "Short",    hint: "30–90 sec · portrait"  },
];

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: "empowering",      label: "Empowering (default)" },
  { value: "functional-data", label: "Functional + Data"    },
  { value: "collaborative",   label: "Collaborative"        },
  { value: "aspirational",    label: "Aspirational"         },
  { value: "witty-clever",    label: "Witty + Clever"       },
];

const defaultGuest: Guest = { name: "", role: "", company: "" };

const defaultForm = {
  videoType:      "clip" as VideoType,
  transcript:     "",
  tonePreference: "empowering" as TonePreference,
  titleCount:     5,
  recapUrl:       "",
  takeaways:      "",
};

function Req() {
  return <span style={{ color: "var(--accent)", marginLeft: 3, fontWeight: 700 }}>*</span>;
}

function Opt() {
  return (
    <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
      — optional
    </span>
  );
}

export default function GeneratorForm({ onSubmit, onClear, loading }: Props) {
  const [videoType, setVideoType]         = useState<VideoType>("clip");
  const [transcript, setTranscript]       = useState("");
  const [tonePreference, setTone]         = useState<TonePreference>("empowering");
  const [titleCount, setTitleCount]       = useState(5);
  const [recapUrl, setRecapUrl]           = useState("");
  const [takeaways, setTakeaways]         = useState("");
  const [guests, setGuests]               = useState<Guest[]>([{ ...defaultGuest }]);

  const isWebinar     = videoType === "webinar";
  const isClipOrShort = videoType === "clip" || videoType === "short";

  const isValid =
    transcript.trim() !== "" &&
    guests[0].name.trim() !== "";

  function updateGuest(index: number, field: keyof Guest, value: string) {
    setGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addGuest() {
    if (guests.length < 4) {
      setGuests(prev => [...prev, { ...defaultGuest }]);
    }
  }

  function removeGuest(index: number) {
    setGuests(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Build guest string for the workflow
    const guestName    = guests.map(g => g.name).filter(Boolean).join(", ");
    const guestRole    = guests.map(g => g.role).filter(Boolean).join(", ");
    const guestCompany = guests.map(g => g.company).filter(Boolean).join(", ");

    const data: FormData = {
      videoType,
      guestName,
      guestRole,
      guestCompany,
      transcript,
      tonePreference,
      titleCount,
      recapUrl: recapUrl || undefined,
      takeaways: takeaways || undefined,
    };

    onSubmit(data);
  }

  function handleClear() {
    setVideoType("clip");
    setTranscript("");
    setTone("empowering");
    setTitleCount(5);
    setRecapUrl("");
    setTakeaways("");
    setGuests([{ ...defaultGuest }]);
    onClear();
  }

  function handleRegenerate() {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: 24 }}>

        {/* Required section */}
        <div style={{ marginBottom: 20 }}>
          <span className="pill">Required</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Video type */}
          <div>
            <label className="field-label">Video type <Req /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {videoTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVideoType(opt.value)}
                  style={{
                    padding: "10px 12px",
                    border: `1px solid ${videoType === opt.value ? "var(--near-black)" : "var(--stroke-green)"}`,
                    background: videoType === opt.value ? "var(--near-black)" : "var(--white)",
                    color: videoType === opt.value ? "#fff" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                    borderRadius: 0,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.7 }}>
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Guests — up to 4 */}
          <div>
            <label className="field-label">
              Guests <Req />
              <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
                — up to 4
              </span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {guests.map((guest, index) => (
                <div key={index} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, border: "1px solid var(--stroke-green)", background: "var(--off-white)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                      Guest {index + 1}
                    </span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeGuest(index)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ef4444" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Full name *"
                    value={guest.name}
                    onChange={(e) => updateGuest(index, "name", e.target.value)}
                    required={index === 0}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Role (optional)"
                      value={guest.role}
                      onChange={(e) => updateGuest(index, "role", e.target.value)}
                    />
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Company (optional)"
                      value={guest.company}
                      onChange={(e) => updateGuest(index, "company", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {guests.length < 4 && (
                <button
                  type="button"
                  onClick={addGuest}
                  className="btn-ghost"
                  style={{ alignSelf: "flex-start", fontSize: 10 }}
                >
                  + Add guest
                </button>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div>
            <label className="field-label">Full transcript <Req /></label>
            <textarea
              className="field-input"
              style={{ minHeight: 220, resize: "vertical", lineHeight: 1.6 }}
              placeholder="Paste the full video transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              required
            />
          </div>

          {/* Takeaways — webinar only, right after transcript */}
          {isWebinar && (
            <div>
              <label className="field-label">
                Takeaways <Opt />
                <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
                  — paste yours to keep consistent; leave blank to auto-generate
                </span>
              </label>
              <textarea
                className="field-input"
                style={{ minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
                placeholder={`e.g.\n• AI search is reshaping how buyers discover tools\n• Brand mentions matter more than backlinks now`}
                value={takeaways}
                onChange={(e) => setTakeaways(e.target.value)}
              />
            </div>
          )}

        </div>

        {/* Optional section */}
        <div style={{ borderTop: "1px solid var(--stroke-primary)", marginTop: 24, paddingTop: 20, marginBottom: 16 }}>
          <span className="pill pill-green">Optional</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="field-label">Tone</label>
            <select
              className="field-input"
              value={tonePreference}
              onChange={(e) => setTone(e.target.value as TonePreference)}
            >
              {toneOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {isClipOrShort && (
            <div>
              <label className="field-label">Title variations</label>
              <input
                className="field-input"
                type="number"
                min={1}
                max={10}
                value={titleCount}
                onChange={(e) => setTitleCount(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="field-label">
            Recap blog URL <Opt />
            <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>
              — used in CTA
            </span>
          </label>
          <input
            className="field-input"
            type="url"
            placeholder="https://www.airops.com/blog/webinar-recap-..."
            value={recapUrl}
            onChange={(e) => setRecapUrl(e.target.value)}
          />
        </div>

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
