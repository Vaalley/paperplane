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
