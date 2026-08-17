import { normalizeArxivId } from './id.ts';
import { parseArxivFeed } from './parser.ts';
import { buildArxivSearchQuery } from './search.ts';
import type { ArxivSearchOptions, ArxivSearchResponse, Paper } from './types.ts';
import { parseArxivVersionHistory } from './version-history.ts';

const ARXIV_ENDPOINT = 'https://export.arxiv.org/api/query';
const USER_AGENT = 'Paperplane/0.0.1 (https://github.com/Vaalley/paperplane)';

export class ArxivClientError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ArxivClientError';
  }
}

async function fetchFeed(endpoint: URL, fetcher: typeof fetch): Promise<ArxivSearchResponse> {
  let response: Response;
  try {
    response = await fetcher(endpoint, { headers: { 'User-Agent': USER_AGENT } });
  } catch (cause) {
    throw new ArxivClientError('Could not reach arXiv.', { cause });
  }

  if (!response.ok) {
    throw new ArxivClientError(`arXiv returned ${response.status}.`);
  }

  try {
    return parseArxivFeed(await response.text());
  } catch (cause) {
    throw new ArxivClientError('arXiv returned an unreadable feed.', { cause });
  }
}

export async function searchArxiv(
  query: string,
  options: ArxivSearchOptions = {},
  fetcher: typeof fetch = fetch,
): Promise<ArxivSearchResponse> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return { papers: [], totalResults: 0, startIndex: 0, itemsPerPage: 0 };
  }

  const endpoint = new URL(ARXIV_ENDPOINT);
  endpoint.searchParams.set('search_query', buildArxivSearchQuery(normalizedQuery, options));
  endpoint.searchParams.set('start', String(Math.max(0, options.start ?? 0)));
  endpoint.searchParams.set(
    'max_results',
    String(Math.min(100, Math.max(1, options.maxResults ?? 12))),
  );
  endpoint.searchParams.set('sortBy', options.sortBy ?? 'relevance');
  endpoint.searchParams.set('sortOrder', options.sortOrder ?? 'descending');

  return await fetchFeed(endpoint, fetcher);
}

export async function getArxivPaper(
  id: string,
  fetcher: typeof fetch = fetch,
): Promise<Paper | null> {
  const normalizedId = normalizeArxivId(id);
  if (!normalizedId) return null;

  const endpoint = new URL(ARXIV_ENDPOINT);
  endpoint.searchParams.set('id_list', normalizedId);
  endpoint.searchParams.set('max_results', '1');

  const response = await fetchFeed(endpoint, fetcher);
  const paper = response.papers[0];
  if (!paper) return null;

  try {
    const historyResponse = await fetcher(paper.abstractUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!historyResponse.ok) return paper;

    return { ...paper, versions: parseArxivVersionHistory(await historyResponse.text()) };
  } catch {
    // Submission history enriches the record but should never make the paper unavailable.
    return paper;
  }
}
