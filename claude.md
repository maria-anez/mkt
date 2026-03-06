# YouTube Optimization Generator

## Project purpose

A focused creator utility tool that generates 4 YouTube optimization outputs from a transcript + guest metadata:
1. Optimized title variations
2. Optimized description (Short or Long-form format)
3. Timestamped chapters
4. First pinned comment (written as AirOps)

Built with Next.js (App Router), TypeScript, Tailwind CSS. Deployable to Vercel.

## Core generation rules

- Pull phrasing from the transcript — never invent keywords
- Reinforce the primary keyword naturally — no stuffing
- Amplify guest authority using name, role, and company
- Tone default: engagement optimized
- Sentence case for all copy
- No filler language: "In this video we discuss...", "Don't forget to like and subscribe"
- Banned words: synergize, robust, comprehensive, seamless, leverage (verb), supercharge, groundbreaking, revolutionary
- Double hyphens (--) for pauses, not em dashes

## Output rules by section

**Titles:** 5 variations, under 70 chars each, different framing angles (direct benefit / curiosity / authority / contrarian / tactical)

**Description (Short):** Hook → authority line → tight summary → 3–5 hashtags → CTA

**Description (Long-form):** Search-optimized opening → authority framing → structured summary → CTA → 5–8 hashtags

**Chapters:** Minimum 5 for long-form, 2–3 for Shorts. Detect real topic shifts. Avoid generic labels. Estimate timestamps if none in transcript.

**Pinned comment:** AirOps voice — conversational, strategic, human. Hook + value + engagement question + optional CTA. Max 1–2 emojis.

## AEO principles

- Optimize for AI engine retrieval and search visibility
- Lead with outcomes and insights
- Surface authority signals early

## UI standards

- Two-column layout: inputs left, outputs right (stacked on mobile)
- AirOps brand system: green palette, sharp corners (no border-radius), Serrif VF headlines, Saans body, Saans Mono labels
- No marketing content — pure utility

## Key files

- `lib/types.ts` — FormData and GenerateResult types
- `lib/buildPrompt.ts` — constructs AirOps visibility prompt from form inputs
- `lib/mockGenerate.ts` — dev mock; returns all 4 sections
- `app/api/generate/route.ts` — POST /api/generate; swap mock for real AirOps endpoint here
- `app/page.tsx` — root generator page (two-column layout)
- `components/GeneratorForm.tsx` — all form inputs
- `components/OutputPanel.tsx` — 4 output sections with per-section copy buttons

## Environment variables

- `AIR_OPS_API_KEY` — set in `.env.local` and Vercel dashboard

## Deployment

Connect repo to Vercel. Set `AIR_OPS_API_KEY` in Vercel environment variables.
