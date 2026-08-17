import type { Paper } from './types.ts';

const baseArxivId = (id: string): string => id.replace(/v\d+$/i, '');

const citationYear = (paper: Paper): string => {
  const match = paper.published?.match(/^(\d{4})/);
  return match?.[1] ?? 'n.d.';
};

const bibtexValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/[{}]/g, (character) => `\\${character}`);

export function formatCitation(paper: Paper): string {
  const authors = paper.authors.length > 0 ? paper.authors.join(', ') : 'Unknown author';
  return `${authors} (${citationYear(paper)}). ${paper.title}. arXiv:${
    baseArxivId(paper.id)
  }. ${paper.abstractUrl}`;
}

export function formatBibtex(paper: Paper): string {
  const id = baseArxivId(paper.id);
  const key = `arxiv_${id.replace(/[^a-z\d]+/gi, '_')}`;
  const fields = [
    ['title', paper.title],
    ['author', paper.authors.join(' and ')],
    ['year', citationYear(paper)],
    ['eprint', id],
    ['archivePrefix', 'arXiv'],
    ['primaryClass', paper.primaryCategory],
    ['doi', paper.doi],
    ['url', paper.abstractUrl],
  ].filter((field): field is [string, string] => Boolean(field[1]));

  return [
    `@misc{${key},`,
    ...fields.map(([name, value], index) =>
      `  ${name} = {${bibtexValue(value)}}${index === fields.length - 1 ? '' : ','}`
    ),
    '}',
  ].join('\n');
}
