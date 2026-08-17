export type PaperVersion = {
  version: number;
  submitted: string;
  size: string | null;
};

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
  primaryCategory: string | null;
  comment: string | null;
  journalReference: string | null;
  doi: string | null;
  versions: PaperVersion[];
};
