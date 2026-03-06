import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Optimization Generator",
  description:
    "Generate optimized YouTube titles, descriptions, chapters, and pinned comments — powered by AirOps visibility prompts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
