# YouTube Visibility Description Generator

## Project purpose

This project generates YouTube descriptions optimized for visibility, AI retrieval (AEO), and engagement. It is a SaaS-style web app built with Next.js (App Router), TypeScript, and Tailwind CSS, deployable to Vercel.

## Core rules for all AI output

- Descriptions must align with AirOps visibility prompts
- Always amplify guest authority using name, role, and company
- Use transcript-derived phrasing — never invent keywords
- Tone default: engagement optimized
- Avoid generic filler: "In this video we discuss...", "Don't forget to like and subscribe", etc.
- Banned words: synergize, robust, comprehensive, seamless, leverage (verb), supercharge, groundbreaking, revolutionary
- Sentence case for all copy (not title case)
- No em dashes — use double hyphens (--) for pauses

## AEO / AirOps principles

- Optimize for AI engine retrieval, not just traditional search
- Lead with outcomes and insights, not features
- Reinforce primary keyword naturally without stuffing
- Short-form and long-form outputs have distinct format rules (see lib/buildPrompt.ts)

## UI standards

- Minimal, high-trust SaaS aesthetic
- AirOps brand system: green palette, sharp corners (no border-radius), Serrif VF headlines, Saans body, Saans Mono labels
- Clean spacing using 4px base scale
- Responsive design

## Key files

- `lib/types.ts` — shared TypeScript types
- `lib/buildPrompt.ts` — constructs the AirOps visibility prompt from form data
- `lib/mockGenerate.ts` — simulates AirOps output for local development
- `app/api/generate/route.ts` — API route; swap mock for real AirOps endpoint here
- `app/page.tsx` — marketing homepage
- `app/generate/page.tsx` — generator interface
- `components/GeneratorForm.tsx` — form with all inputs
- `components/OutputSection.tsx` — output display with copy/regenerate

## Environment variables

- `AIR_OPS_API_KEY` — AirOps API key (set in .env.local and Vercel dashboard)

## Deployment

Deploy to Vercel. Set `AIR_OPS_API_KEY` in Vercel environment variables before going live.
