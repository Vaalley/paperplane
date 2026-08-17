import type { ArxivSearchResponse, Paper } from './types.ts';

const ARXIV_ID_PATTERN = /^(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?$/i;

const decodeXml = (value: string): string =>
  value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code: string) => {
    const namedEntities: Record<string, string> = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
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

const normalizeText = (value: string): string =>
  decodeXml(
    value
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const tagPattern = (tag: string, flags = 'i') =>
  new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${tag}\\s*>`,
    flags,
  );

const elementText = (xml: string, tag: string): string => {
  const match = xml.match(tagPattern(tag));
  return match ? normalizeText(match[1]) : '';
};

const elements = (xml: string, tag: string): string[] =>
  [...xml.matchAll(tagPattern(tag, 'gi'))].map((match) => match[0]);

const openingTags = (xml: string, tag: string): string[] => {
  const pattern = new RegExp(`<(?:[\\w.-]+:)?${tag}\\b[^>]*>`, 'gi');
  return [...xml.matchAll(pattern)].map((match) => match[0]);
};

const attribute = (tag: string, name: string): string | null => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\s${escapedName}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? decodeXml(match[2]).trim() : null;
};

const feedNumber = (xml: string, tag: string): number => {
  const parsed = Number.parseInt(elementText(xml, tag), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const arxivIdFrom = (rawId: string): string | null => {
  const value = rawId.trim().replace(/^arXiv:/i, '');
  let candidate = value;

  try {
    const url = new URL(value);
    const marker = '/abs/';
    const markerIndex = url.pathname.indexOf(marker);
    candidate = markerIndex >= 0 ? url.pathname.slice(markerIndex + marker.length) : '';
  } catch {
    // Bare arXiv identifiers are valid feed IDs too.
  }

  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    return null;
  }

  return ARXIV_ID_PATTERN.test(candidate) ? candidate : null;
};

const parseEntry = (entry: string): Paper | null => {
  const id = arxivIdFrom(elementText(entry, 'id'));
  if (!id) return null;

  const authors = elements(entry, 'author')
    .map((author) => elementText(author, 'name'))
    .filter(Boolean);
  const categories = openingTags(entry, 'category')
    .map((category) => attribute(category, 'term'))
    .filter((category): category is string => Boolean(category));
  const links = openingTags(entry, 'link').map((link) => ({
    href: attribute(link, 'href'),
    rel: attribute(link, 'rel'),
    title: attribute(link, 'title'),
    type: attribute(link, 'type'),
  }));
  const pdfLink = links.find(
    (link) => link.title?.toLowerCase() === 'pdf' || link.type?.toLowerCase() === 'application/pdf',
  );
  const abstractLink = links.find((link) => link.rel?.toLowerCase() === 'alternate');

  return {
    id,
    title: elementText(entry, 'title'),
    summary: elementText(entry, 'summary'),
    authors,
    published: elementText(entry, 'published') || null,
    updated: elementText(entry, 'updated') || null,
    abstractUrl: abstractLink?.href || `https://arxiv.org/abs/${id}`,
    pdfUrl: pdfLink?.href || null,
    categories: [...new Set(categories)],
  };
};

export function parseArxivFeed(xml: string): ArxivSearchResponse {
  const papers = elements(xml, 'entry')
    .map(parseEntry)
    .filter((paper): paper is Paper => paper !== null);

  return {
    papers,
    totalResults: feedNumber(xml, 'totalResults'),
    startIndex: feedNumber(xml, 'startIndex'),
    itemsPerPage: feedNumber(xml, 'itemsPerPage'),
  };
}
