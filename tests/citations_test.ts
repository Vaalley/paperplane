import { formatBibtex, formatCitation } from '../src/lib/papers/citations.ts';
import type { Paper } from '../src/lib/papers/types.ts';

const paper: Paper = {
  id: '2401.12345v2',
  title: 'A {representative} paper',
  summary: 'An abstract',
  authors: ['Ada Lovelace', 'Alan Turing'],
  published: '2024-01-31T10:00:00Z',
  updated: '2024-02-02T12:00:00Z',
  abstractUrl: 'https://arxiv.org/abs/2401.12345v2',
  pdfUrl: 'https://arxiv.org/pdf/2401.12345v2',
  categories: ['cs.AI', 'cs.LG'],
  primaryCategory: 'cs.AI',
  comment: null,
  journalReference: null,
  doi: '10.1000/example.123',
  versions: [],
};

const assertIncludes = (actual: string, expected: string) => {
  if (!actual.includes(expected)) {
    throw new Error(`Expected ${JSON.stringify(actual)} to include ${JSON.stringify(expected)}`);
  }
};

Deno.test('formats plain-text and BibTeX citations from arXiv metadata', () => {
  assertIncludes(formatCitation(paper), 'Ada Lovelace, Alan Turing (2024)');
  assertIncludes(formatCitation(paper), 'arXiv:2401.12345');

  const bibtex = formatBibtex(paper);
  assertIncludes(bibtex, '@misc{arxiv_2401_12345,');
  assertIncludes(bibtex, 'author = {Ada Lovelace and Alan Turing}');
  assertIncludes(bibtex, 'title = {A \\{representative\\} paper}');
  assertIncludes(bibtex, 'primaryClass = {cs.AI}');
  assertIncludes(bibtex, 'doi = {10.1000/example.123}');
});
