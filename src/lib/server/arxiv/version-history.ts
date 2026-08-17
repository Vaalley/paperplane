import type { PaperVersion } from '../../papers/types.ts';

const decodeHtml = (value: string): string =>
  value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
    const namedEntities: Record<string, string> = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      nbsp: ' ',
    };
    const normalized = code.toLowerCase();
    if (normalized in namedEntities) return namedEntities[normalized];

    const radix = normalized.startsWith('#x') ? 16 : 10;
    const numericCode = Number.parseInt(normalized.replace(/^#x?/, ''), radix);
    try {
      return Number.isNaN(numericCode) ? entity : String.fromCodePoint(numericCode);
    } catch {
      return entity;
    }
  });

export function parseArxivVersionHistory(html: string): PaperVersion[] {
  const section = html.match(
    /<div\b[^>]*class=(['"])[^'"]*\bsubmission-history\b[^'"]*\1[^>]*>([\s\S]*?)<\/div>/i,
  )?.[2];
  if (!section) return [];

  const text = decodeHtml(
    section
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  );
  const versions: PaperVersion[] = [];
  const pattern =
    /\[v(\d+)\]\s+([A-Z][a-z]{2},\s+\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+UTC)(?:\s+\(([^)]+)\))?/g;

  for (const match of text.matchAll(pattern)) {
    versions.push({
      version: Number.parseInt(match[1], 10),
      submitted: match[2],
      size: match[3]?.trim() || null,
    });
  }

  return versions;
}
