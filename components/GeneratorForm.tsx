"use client";

import { useState, useEffect } from "react";
import type { FormData, TonePreference } from "@/lib/types";

type VideoType = "webinar" | "clip" | "short";

interface Props {
  onSubmit: (data: FormData) => void;
  onClear: () => void;
  loading: boolean;
  activeType: VideoType;
  onTypeChange: (type: VideoType) => void;
  prefillTranscript?: string;
}

interface Guest {
  name: string;
  role: string;
  company: string;
}

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: "empowering",      label: "Empowering (default)" },
  { value: "functional-data", label: "Functional + Data"    },
  { value: "collaborative",   label: "Collaborative"        },
  { value: "aspirational",    label: "Aspirational"         },
  { value: "witty-clever",    label: "Witty + Clever"       },
];

const defaultGuest: Guest = { name: "", role: "", company: "" };

function Req() {
  return <span style={{ color: "var(--accent)", marginLeft: 3, fontWeight: 700 }}>*</span>;
}

export default function GeneratorForm({ onSubmit, onClear, loading, activeType, onTypeChange, prefillTranscript }: Props) {
  const [transcript, setTranscript]   = useState("");

  useEffect(() => {
    if (prefillTranscript) {
      setTranscript(prefillTranscript);
    }
  }, [prefillTranscript]);
  const [tonePreference, setTone]     = useState<TonePreference>("empowering");
  const [titleCount, setTitleCount]   = useState(5);
  const [recapUrl, setRecapUrl]       = useState("");
  const [takeaways, setTakeaways]     = useState("");
  const [guests, setGuests]           = useState<Guest[]>([{ ...defaultGuest }]);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [eventTopic, setEventTopic]   = useState("");

  const isWebinar     = activeType === "webinar";
  const isClipOrShort = activeType === "clip" || activeType === "short";

  const isValid = transcript.trim() !== "" && guests[0].name.trim() !== "";

  function updateGuest(index: number, field: keyof Guest, value: string) {
    setGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addGuest() {
    if (guests.length < 4) setGuests(prev => [...prev, { ...defaultGuest }]);
  }

  function removeGuest(index: number) {
    setGuests(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const guestName    = guests.map(g => g.name).filter(Boolean).join(", ");
    const guestRole    = guests.map(g => g.role).filter(Boolean).join(", ");
    const guestCompany = guests.map(g => g.company).filter(Boolean).join(", ");

    const guestNameForTitle = guests.map(g => g.name).filter(Boolean).join(", ");
    const videoTitle = activeType === "webinar" && eventTopic
      ? `${eventTopic} | AirOps & ${guestNameForTitle}`
      : undefined;

    const data: FormData = {
      videoType: activeType,
      guestName,
      guestRole,
      guestCompany,
      videoTitle,
      transcript,
      tonePreference,
      titleCount,
      recapUrl: recapUrl || undefined,
      takeaways: takeaways || undefined,
    };

    setLastFormData(data);
    onSubmit(data);
  }

  function handleClear() {
    setTranscript("");
    setTone("empowering");
    setTitleCount(5);
    setRecapUrl("");
    setTakeaways("");
    setGuests([{ ...defaultGuest }]);
    setLastFormData(null);
    setEventTopic("");
    onClear();
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Format header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--forest)",
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {activeType === "webinar" && "Webinar copy"}
          {activeType === "clip" && "Clip copy"}
          {activeType === "short" && "Short copy"}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
          {activeType === "webinar" && "Title · description · chapters · pinned comment"}
          {activeType === "clip" && "Title · description · pinned comment"}
          {activeType === "short" && "Title · description · pinned comment"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Guests */}
        <div>
          <label className="field-label">
            Guests <Req />
            <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>— up to 4</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {guests.map((guest, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, border: "1px solid var(--stroke-green)", background: "var(--off-white)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                    Guest {index + 1}
                  </span>
                  {index > 0 && (
                    <button type="button" onClick={() => removeGuest(index)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, color: "#ef4444", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Remove
                    </button>
                  )}
                </div>
                <input className="field-input" type="text" placeholder="Full name *" value={guest.name} onChange={(e) => updateGuest(index, "name", e.target.value)} required={index === 0} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input className="field-input" type="text" placeholder="Role (optional)" value={guest.role} onChange={(e) => updateGuest(index, "role", e.target.value)} />
                  <input className="field-input" type="text" placeholder="Company (optional)" value={guest.company} onChange={(e) => updateGuest(index, "company", e.target.value)} />
                </div>
              </div>
            ))}
            {guests.length < 4 && (
              <button type="button" onClick={addGuest} className="btn-ghost" style={{ alignSelf: "flex-start", fontSize: 10 }}>
                + Add guest
              </button>
            )}
          </div>
        </div>

        {/* Event topic — webinar only */}
        {activeType === "webinar" && (
          <div>
            <label className="field-label">Event topic / name <Req /></label>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. BOFU Content Playbook, AEO for Growth"
              value={eventTopic}
              onChange={(e) => setEventTopic(e.target.value)}
              required={activeType === "webinar"}
            />
          </div>
        )}

        {/* Transcript */}
        <div>
          <label className="field-label">Full transcript <Req /></label>
          <textarea
            className="field-input"
            style={{ minHeight: 200, resize: "vertical", lineHeight: 1.6 }}
            placeholder="Paste the full video transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            required
          />
        </div>

        {/* Takeaways — webinar only */}
        {isWebinar && (
          <div>
            <label className="field-label">
              Takeaways
              <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>— optional, paste yours or leave blank to auto-generate</span>
            </label>
            <textarea
              className="field-input"
              style={{ minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
              placeholder={`e.g.\n• AI search is reshaping how buyers discover tools\n• Brand mentions matter more than backlinks now`}
              value={takeaways}
              onChange={(e) => setTakeaways(e.target.value)}
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--stroke-primary)", paddingTop: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Optional</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="field-label">Tone</label>
            <select className="field-input" value={tonePreference} onChange={(e) => setTone(e.target.value as TonePreference)}>
              {toneOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {isClipOrShort && (
            <div>
              <label className="field-label">Title variations</label>
              <input className="field-input" type="number" min={1} max={10} value={titleCount} onChange={(e) => setTitleCount(Number(e.target.value))} />
            </div>
          )}
        </div>

        <div>
          <label className="field-label">
            Recap blog URL
            <span style={{ color: "var(--text-tertiary)", marginLeft: 6, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 11 }}>— optional</span>
          </label>
          <input className="field-input" type="url" placeholder="https://www.airops.com/blog/..." value={recapUrl} onChange={(e) => setRecapUrl(e.target.value)} />
        </div>

        {/* Actions */}
        <div style={{ paddingTop: 8 }}>
          <button type="submit" className="btn-accent" style={{ width: "100%", padding: "14px 0", fontSize: 15 }} disabled={!isValid || loading}>
            {loading ? "Generating..." : "Generate ✦"}
          </button>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" className="btn-ghost" style={{ flex: 1, padding: "10px 0" }} onClick={() => lastFormData && onSubmit(lastFormData)} disabled={!isValid || loading}>
              Regenerate
            </button>
            <button type="button" className="btn-ghost" style={{ flex: 1, padding: "10px 0" }} onClick={handleClear} disabled={loading}>
              Clear all
            </button>
          </div>
        </div>

      </div>
    </form>
  );
}
