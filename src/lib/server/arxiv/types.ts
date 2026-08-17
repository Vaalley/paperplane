export type Paper = {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string | null;
  updated: string | null;
  abstractUrl: string;
  pdfUrl: string | null;
  categories: string[];
};

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
};
