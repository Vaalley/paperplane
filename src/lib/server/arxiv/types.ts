import type { Paper } from '../../papers/types.ts';

export type { Paper } from '../../papers/types.ts';

export type ArxivSearchResponse = {
  papers: Paper[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
};

export type ArxivSearchOptions = {
  start?: number;
  maxResults?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
  category?: string;
  fromDate?: string;
  toDate?: string;
};
