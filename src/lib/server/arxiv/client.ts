import { parseArxivFeed } from './parser.ts';
import type { ArxivSearchOptions, ArxivSearchResponse } from './types.ts';

const ARXIV_ENDPOINT = 'https://export.arxiv.org/api/query';
const USER_AGENT = 'Paperplane/0.0.1 (https://github.com/Vaalley/paperplane)';

export class ArxivClientError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ArxivClientError';
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
  endpoint.searchParams.set('search_query', `all:${normalizedQuery}`);
  endpoint.searchParams.set('start', String(Math.max(0, options.start ?? 0)));
  endpoint.searchParams.set(
    'max_results',
    String(Math.min(100, Math.max(1, options.maxResults ?? 12))),
  );
  endpoint.searchParams.set('sortBy', options.sortBy ?? 'relevance');
  endpoint.searchParams.set('sortOrder', options.sortOrder ?? 'descending');

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
