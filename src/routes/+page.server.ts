import type { PageServerLoad } from './$types';

type Paper = {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdfUrl: string;
  categories: string[];
};

const decode = (value: string) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");

const text = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decode(match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()) : '';
};

function parseFeed(xml: string): Paper[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];

  return entries.map((entry) => {
    const idUrl = text(entry, 'id');
    const id = idUrl.split('/abs/').at(-1) ?? idUrl;
    const authors = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)]
      .map((match) => decode(match[1].replace(/\s+/g, ' ').trim()));
    const categories = [...entry.matchAll(/<category[^>]+term=["']([^"']+)["'][^>]*\/?>(?:<\/category>)?/gi)]
      .map((match) => match[1]);
    const pdfMatch = entry.match(/<link[^>]+href=["']([^"']+)["'][^>]+title=["']pdf["'][^>]*\/?>(?:<\/link>)?/i);

    return {
      id,
      title: text(entry, 'title'),
      summary: text(entry, 'summary'),
      authors,
      published: text(entry, 'published'),
      pdfUrl: pdfMatch?.[1] ?? `https://arxiv.org/pdf/${id}`,
      categories
    };
  });
}

export const load: PageServerLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q')?.trim() ?? '';

  if (!query) {
    return { query, papers: [] as Paper[], error: null as string | null };
  }

  const endpoint = new URL('https://export.arxiv.org/api/query');
  endpoint.searchParams.set('search_query', `all:${query}`);
  endpoint.searchParams.set('start', '0');
  endpoint.searchParams.set('max_results', '12');
  endpoint.searchParams.set('sortBy', 'relevance');
  endpoint.searchParams.set('sortOrder', 'descending');

  try {
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'Paperplane/0.0.1 (https://github.com/Vaalley/paperplane)' }
    });

    if (!response.ok) throw new Error(`arXiv returned ${response.status}`);

    const xml = await response.text();
    return { query, papers: parseFeed(xml), error: null as string | null };
  } catch (error) {
    console.error(error);
    return {
      query,
      papers: [] as Paper[],
      error: 'Paperplane could not reach arXiv right now. Please try again.'
    };
  }
};
