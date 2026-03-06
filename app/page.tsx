import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main style={{ fontFamily: "var(--font-sans)" }}>
      <Nav />

      {/* Hero */}
      <section
        style={{
          background: "var(--hero-bg)",
          color: "#ffffff",
          padding: "96px 24px 80px",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <span className="pill" style={{ marginBottom: 24, display: "inline-flex" }}>
            AirOps-powered
          </span>
          <h1
            className="headline"
            style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1.0, marginBottom: 24, color: "#ffffff" }}
          >
            Turn every video into a visibility engine.
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "#a5aab6",
              marginBottom: 40,
              maxWidth: 580,
            }}
          >
            AI-powered YouTube descriptions aligned with search, AI retrieval,
            and authority signals — built on AirOps visibility prompts.
          </p>
          <Link href="/generate">
            <button className="btn-accent" style={{ fontSize: 16, padding: "14px 32px" }}>
              Generate description
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "var(--off-white)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span className="pill" style={{ marginBottom: 16, display: "inline-flex" }}>
            What it does
          </span>
          <h2
            className="headline"
            style={{ fontSize: "clamp(32px, 4vw, 52px)", marginBottom: 56, lineHeight: 1.1 }}
          >
            Every signal. One description.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 1,
              background: "var(--stroke-green)",
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="card"
                style={{ background: "var(--white)", gap: 12, display: "flex", flexDirection: "column" }}
              >
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--near-black)" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "80px 24px", background: "var(--white)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <span className="pill" style={{ marginBottom: 16, display: "inline-flex" }}>
            How it works
          </span>
          <h2
            className="headline"
            style={{ fontSize: "clamp(32px, 4vw, 52px)", marginBottom: 56, lineHeight: 1.1 }}
          >
            Four steps to publish with confidence.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderLeft: "2px solid var(--stroke-green)" }}>
            {steps.map((s, i) => (
              <div
                key={s.title}
                style={{ paddingLeft: 32, paddingBottom: 40, position: "relative" }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: -13,
                    top: 0,
                    width: 24,
                    height: 24,
                    background: i === 0 ? "var(--interaction)" : "var(--white)",
                    border: "2px solid var(--stroke-green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--near-black)",
                  }}
                >
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: "var(--green-600)",
          color: "#ffffff",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            className="headline"
            style={{ fontSize: "clamp(32px, 4vw, 52px)", marginBottom: 20, color: "#ffffff", lineHeight: 1.1 }}
          >
            Ready to get cited?
          </h2>
          <p style={{ fontSize: 17, color: "var(--green-200)", marginBottom: 40, lineHeight: 1.6 }}>
            Stop writing descriptions that disappear. Start generating ones that get found — by search, by AI, by your next subscriber.
          </p>
          <Link href="/generate">
            <button className="btn-accent" style={{ fontSize: 16, padding: "14px 32px" }}>
              Start free
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

const features = [
  {
    icon: "⟲",
    title: "Transcript-driven keyword extraction",
    description:
      "Pulls semantic phrasing directly from your video transcript — no guessing, no generic filler.",
  },
  {
    icon: "↑",
    title: "Guest authority amplification",
    description:
      "Surfaces guest credentials and company context to build trust signals and discoverability.",
  },
  {
    icon: "◈",
    title: "Shorts vs long-form optimization",
    description:
      "Formats and lengths tuned to YouTube's ranking logic for each video type.",
  },
  {
    icon: "◎",
    title: "Tone-controlled engagement logic",
    description:
      "Six tone modes from conversational to executive — matched to your audience and content intent.",
  },
  {
    icon: "✦",
    title: "AirOps visibility prompts",
    description:
      "Structured prompts that optimize for AI retrieval, search, and engagement simultaneously.",
  },
];

const steps = [
  {
    title: "Paste your transcript",
    description:
      "Drop in the full video transcript. The model reads it for keywords, context, and phrasing.",
  },
  {
    title: "Add guest info + primary keyword",
    description:
      "Name, role, company, and the keyword you want to rank for. Takes 30 seconds.",
  },
  {
    title: "Generate your optimized description",
    description:
      "AirOps visibility prompts produce a description tuned for search, AI retrieval, and click-through.",
  },
  {
    title: "Publish with confidence",
    description:
      "Copy and paste. Your description is ready — no rewrites, no second-guessing.",
  },
];
