import { GroundingSource } from "@/types";

/**
 * Fetches real-time live Marathi/English industry & policy updates from Google News RSS.
 * Runs with a strict timeout so it never blocks or delays the AI dialogue.
 */
export async function fetchLiveGoogleUpdates(
  query: string,
  section?: string
): Promise<GroundingSource[]> {
  try {
    const cleanQuery = query
      .replace(/[?!,।]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const searchTerm = `${cleanQuery} महाराष्ट्र उद्योग MSME शासन निर्णय`;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
      searchTerm
    )}&hl=mr&gl=IN&ceid=IN:mr`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2800);

    const res = await fetch(rssUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    const sources: GroundingSource[] = [];

    for (const item of items.slice(0, 4)) {
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);

      if (titleMatch?.[1] && linkMatch?.[1]) {
        let cleanTitle = titleMatch[1]
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        // Strip publisher suffix if present
        const parts = cleanTitle.split(" - ");
        if (parts.length > 1) {
          cleanTitle = parts[0].trim();
        }

        const rawUrl = linkMatch[1].trim();

        if (cleanTitle.length > 5 && rawUrl.startsWith("http")) {
          sources.push({
            title: cleanTitle.slice(0, 85),
            url: rawUrl,
          });
        }
      }
    }

    return sources;
  } catch {
    return [];
  }
}

