import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--stroke-primary)",
        background: "var(--white)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            fontWeight: 400,
            color: "var(--near-black)",
            letterSpacing: "-0.02em",
          }}
        >
          VizGen
        </span>
      </Link>

      <Link href="/generate">
        <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
          Get started
        </button>
      </Link>
    </nav>
  );
}
