import type { AirOpsPrompt } from "./types";

const BRAND_KIT_ID = 7868;
const AIROPS_API_BASE = "https://app.airops.com/api/v1";
const PER_PAGE = 100;
const MAX_PAGES = 3; // fetches up to 300 prompts

type RawPrompt = {
  text?: string;
  citation_rate?: number;
  mention_rate?: number;
  keyword?: string;
};

function buildQuery(page: number): string {
  return [
    `fields[]=text`,
    `fields[]=citation_rate`,
    `fields[]=mention_rate`,
    `fields[]=keyword`,
    `sort=-citation_rate`,
    `per_page=${PER_PAGE}`,
    `page=${page}`,
  ].join("&");
}

export async function fetchAirOpsPrompts(): Promise<AirOpsPrompt[]> {
  const apiKey = process.env.AIROPS_API_KEY;
  if (!apiKey) return [];

  try {
    const allItems: RawPrompt[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const response = await fetch(
        `${AIROPS_API_BASE}/brand_kits/${BRAND_KIT_ID}/aeo_prompts?${buildQuery(page)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`[fetchAirOpsPrompts] API error ${response.status} on page ${page}`);
        break;
      }

      const json = await response.json();
      const items: RawPrompt[] = json.data ?? [];
      allItems.push(...items);

      const totalPages: number = json.meta?.total_pages ?? 1;
      if (page >= totalPages) break;
    }

    console.info(`[fetchAirOpsPrompts] loaded ${allItems.length} prompts from AirOps API`);

    return allItems.map((item) => ({
      name: item.text ?? "",
      description: item.keyword ? `Related keyword: ${item.keyword}` : item.text ?? "",
      citation_rate: item.citation_rate ?? 0,
    })) as AirOpsPrompt[];
  } catch (err) {
    console.warn("[fetchAirOpsPrompts] fetch failed, falling back to local prompts:", err);
    return [];
  }
}
