import type { ArxivSearchOptions } from './types.ts';

const CATEGORY_PATTERN = /^[a-z]+(?:-[a-z]+)*(?:\.[a-z-]+)?$/i;
const FIRST_ARXIV_DATE = '199101010000';
const LAST_ARXIV_DATE = '299912312359';

export function normalizeArxivCategory(value: string): string | null {
  const category = value.trim();
  return CATEGORY_PATTERN.test(category) ? category : null;
}

export function normalizeArxivDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

const apiDate = (value: string, endOfDay: boolean): string =>
  `${value.replaceAll('-', '')}${endOfDay ? '2359' : '0000'}`;

export function buildArxivSearchQuery(
  query: string,
  { category, fromDate, toDate }: ArxivSearchOptions,
): string {
  const parts = [`all:${query.trim()}`];
  const normalizedCategory = category ? normalizeArxivCategory(category) : null;
  const normalizedFrom = fromDate ? normalizeArxivDate(fromDate) : null;
  const normalizedTo = toDate ? normalizeArxivDate(toDate) : null;

  if (normalizedCategory) parts.push(`cat:${normalizedCategory}`);
  if (normalizedFrom || normalizedTo) {
    parts.push(
      `submittedDate:[${normalizedFrom ? apiDate(normalizedFrom, false) : FIRST_ARXIV_DATE} TO ${
        normalizedTo ? apiDate(normalizedTo, true) : LAST_ARXIV_DATE
      }]`,
    );
  }

  return parts.join(' AND ');
}
