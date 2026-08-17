import {
  normalizeArxivCategory,
  normalizeArxivDate,
  type Paper,
  searchArxiv,
} from '$lib/server/arxiv/index.ts';
import type { PageServerLoad } from './$types.d.ts';

const PAGE_SIZE = 12;
type SearchSort = 'relevance' | 'newest' | 'oldest';

const searchSort = (value: string | null): SearchSort =>
  value === 'newest' || value === 'oldest' ? value : 'relevance';

const searchPage = (value: string | null): number => {
  if (!value || !/^\d+$/.test(value)) return 1;
  return Math.min(2_500, Math.max(1, Number.parseInt(value, 10)));
};

export const load: PageServerLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q')?.trim() ?? '';
  const sort = searchSort(url.searchParams.get('sort'));
  const rawCategory = url.searchParams.get('category')?.trim() ?? '';
  const rawFromDate = url.searchParams.get('from') ?? '';
  const rawToDate = url.searchParams.get('to') ?? '';
  const normalizedCategory = rawCategory ? normalizeArxivCategory(rawCategory) : null;
  const normalizedFromDate = rawFromDate ? normalizeArxivDate(rawFromDate) : null;
  const normalizedToDate = rawToDate ? normalizeArxivDate(rawToDate) : null;
  const page = searchPage(url.searchParams.get('page'));

  const baseData = {
    query,
    sort,
    category: rawCategory,
    fromDate: rawFromDate,
    toDate: rawToDate,
    page,
    pageSize: PAGE_SIZE,
    totalResults: 0,
    totalPages: 0,
    previousUrl: null as string | null,
    nextUrl: null as string | null,
  };

  if (!query) {
    return { ...baseData, papers: [] as Paper[], error: null as string | null };
  }

  if (
    (rawCategory && !normalizedCategory) ||
    (rawFromDate && !normalizedFromDate) ||
    (rawToDate && !normalizedToDate) ||
    (normalizedFromDate && normalizedToDate && normalizedFromDate > normalizedToDate)
  ) {
    return {
      ...baseData,
      papers: [] as Paper[],
      error: 'Check the category and date filters, then try again.',
    };
  }

  try {
    const sortOptions = sort === 'newest'
      ? { sortBy: 'submittedDate' as const, sortOrder: 'descending' as const }
      : sort === 'oldest'
      ? { sortBy: 'submittedDate' as const, sortOrder: 'ascending' as const }
      : { sortBy: 'relevance' as const, sortOrder: 'descending' as const };
    const response = await searchArxiv(
      query,
      {
        start: (page - 1) * PAGE_SIZE,
        maxResults: PAGE_SIZE,
        category: normalizedCategory || undefined,
        fromDate: normalizedFromDate || undefined,
        toDate: normalizedToDate || undefined,
        ...sortOptions,
      },
      fetch,
    );
    const totalPages = Math.min(2_500, Math.ceil(response.totalResults / PAGE_SIZE));
    const pageUrl = (targetPage: number) => {
      const params = new URLSearchParams(url.searchParams);
      if (targetPage <= 1) params.delete('page');
      else params.set('page', String(targetPage));
      return `/?${params.toString()}`;
    };

    return {
      ...baseData,
      papers: response.papers,
      totalResults: response.totalResults,
      totalPages,
      previousUrl: page > 1 ? pageUrl(page - 1) : null,
      nextUrl: page < totalPages ? pageUrl(page + 1) : null,
      error: null as string | null,
    };
  } catch (error) {
    console.error(error);
    return {
      ...baseData,
      papers: [] as Paper[],
      error: 'Paperplane could not reach arXiv right now. Please try again.',
    };
  }
};
