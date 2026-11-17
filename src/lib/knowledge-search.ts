import knowledgeBaseData from "@/data/knowledge-base.json";
import { KnowledgeRecord, KnowledgeSearchResult, SectionId } from "@/types";

const RECORDS = knowledgeBaseData as KnowledgeRecord[];

const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

/**
 * Normalizes Devanagari numerals (०-९) to ASCII digits (0-9)
 * and cleans punctuation/whitespace for robust bilingual matching.
 */
export function normalizeQueryText(input: string): string {
  const replaced = input.replace(/[०-९]/g, (ch) => DEVANAGARI_DIGITS[ch] ?? ch);
  return replaced
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s%.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAllKnowledgeRecords(): KnowledgeRecord[] {
  return RECORDS;
}

/**
 * Searches verified local knowledge base with phrase scoring, token matching,
 * and optional department section boost.
 */
export function searchKnowledgeBase(
  query: string,
  section?: SectionId | string | null,
  limit = 3
): KnowledgeSearchResult[] {
  const normalized = normalizeQueryText(query);
  if (!normalized && !section) return [];

  const tokens = normalized.split(" ").filter((t) => t.length >= 2);

  const scored: KnowledgeSearchResult[] = RECORDS.map((record) => {
    let score = 0;

    if (section && record.section === section) {
      score += 18;
    }

    const titleNorm = normalizeQueryText(record.title);
    const summaryNorm = normalizeQueryText(record.summary);
    const deptNorm = normalizeQueryText(record.department);

    for (const kw of record.keywords) {
      const kwNorm = normalizeQueryText(kw);
      if (!kwNorm) continue;

      if (normalized.includes(kwNorm)) {
        // Multi-word or exact keyword phrase match gets high weight
        score += kwNorm.includes(" ") ? 28 : 16;
      } else {
        for (const token of tokens) {
          if (kwNorm === token) score += 14;
          else if (kwNorm.includes(token) || token.includes(kwNorm)) score += 7;
        }
      }
    }

    for (const token of tokens) {
      if (titleNorm.includes(token)) score += 9;
      if (summaryNorm.includes(token)) score += 4;
      if (deptNorm.includes(token)) score += 3;
    }

    return { record, score };
  })
    .filter((item) => item.score > (section ? 18 : 6))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

/**
 * Formats a verified knowledge record as a clean, structured Marathi fallback response
 * when Gemini API is unavailable or unconfigured.
 */
export function formatKnowledgeFallbackReply(
  record: KnowledgeRecord,
  userName?: string
): string {
  const greeting = userName ? `${userName}जी, ` : "";
  const eligibilityBullets = record.eligibility.map((e) => `  - ${e}`).join("\n");
  const documentBullets = record.documents.map((d) => `  - ${d}`).join("\n");
  const stepBullets = record.steps.map((s, idx) => `  ${idx + 1}. ${s}`).join("\n");

  const lines = [
    `${greeting}तुमच्या प्रश्नासंबंधी **${record.title}** या अधिकृत योजनेची प्रमाणित माहिती खालीलप्रमाणे आहे:`,
    "",
    `- **योजना व प्रमुख लाभ**: ${record.summary} ${record.benefits}`,
    `- **पात्रता निकष**:\n${eligibilityBullets}`,
    `- **आवश्यक कागदपत्रे**:\n${documentBullets}`,
    `- **पुढील पायऱ्या (Step-by-Step)**:\n${stepBullets}`,
    `- **अधिकृत संदर्भ व पोर्टल**: ${record.department} (${record.grReference}) — [अधिकृत संकेतस्थळाला भेट द्या](${record.officialUrl})`,
  ];

  if (record.latestUpdate) {
    lines.push(`- **ताजी माहिती / २०२५-२६ अपडेट**: ${record.latestUpdate}`);
  }

  if (record.leadershipNote) {
    lines.push("", `> **भाजप उद्योग आघाडी विशेष**: ${record.leadershipNote}`);
  }

  return lines.join("\n");
}

