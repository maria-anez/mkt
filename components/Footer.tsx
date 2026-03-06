export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--stroke-primary)",
        padding: "32px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}
      >
        Powered by AirOps
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-tertiary)",
          letterSpacing: "0.06em",
        }}
      >
        YouTube Visibility Description Generator
      </span>
    </footer>
  );
}
