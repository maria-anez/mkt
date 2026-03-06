import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Visibility Description Generator",
  description:
    "AI-powered YouTube descriptions aligned with search, AI retrieval, and authority signals. Powered by AirOps visibility prompts.",
  openGraph: {
    title: "YouTube Visibility Description Generator",
    description:
      "Turn every video into a visibility engine with AI-optimized YouTube descriptions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
