import type { Paper } from '../papers/types.ts';

export type SavedPaper = Paper & { savedAt: string };
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const STORAGE_KEY = 'paperplane:saved-papers:v1';
const CHANGE_EVENT = 'paperplane:saved-papers-change';

const browserStorage = (): StorageLike | null => {
  if (!('document' in globalThis)) return null;

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isNullableString = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null;

const nullableString = (value: unknown): string | null => isNullableString(value) ? value : null;

const savedPaperFrom = (value: unknown): SavedPaper | null => {
  if (!value || typeof value !== 'object') return null;
  const paper = value as Record<string, unknown>;

  const valid = typeof paper.id === 'string' &&
    typeof paper.title === 'string' &&
    typeof paper.summary === 'string' &&
    isStringArray(paper.authors) &&
    isNullableString(paper.published) &&
    isNullableString(paper.updated) &&
    typeof paper.abstractUrl === 'string' &&
    isNullableString(paper.pdfUrl) &&
    isStringArray(paper.categories) &&
    typeof paper.savedAt === 'string';
  if (!valid) return null;

  const versions = Array.isArray(paper.versions)
    ? paper.versions.flatMap((value) => {
      if (!value || typeof value !== 'object') return [];
      const version = value as Record<string, unknown>;
      return Number.isInteger(version.version) &&
          typeof version.submitted === 'string' &&
          isNullableString(version.size)
        ? [{
          version: version.version as number,
          submitted: version.submitted,
          size: version.size,
        }]
        : [];
    })
    : [];

  return {
    id: paper.id as string,
    title: paper.title as string,
    summary: paper.summary as string,
    authors: paper.authors as string[],
    published: paper.published as string | null,
    updated: paper.updated as string | null,
    abstractUrl: paper.abstractUrl as string,
    pdfUrl: paper.pdfUrl as string | null,
    categories: paper.categories as string[],
    primaryCategory: nullableString(paper.primaryCategory),
    comment: nullableString(paper.comment),
    journalReference: nullableString(paper.journalReference),
    doi: nullableString(paper.doi),
    versions,
    savedAt: paper.savedAt as string,
  };
};

const notify = (storage: StorageLike | null) => {
  if ('document' in globalThis && storage === browserStorage()) {
    globalThis.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
};

export function readSavedPapers(storage: StorageLike | null = browserStorage()): SavedPaper[] {
  if (!storage) return [];

  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value)
      ? value.flatMap((paper) => {
        const savedPaper = savedPaperFrom(paper);
        return savedPaper ? [savedPaper] : [];
      })
      : [];
  } catch {
    return [];
  }
}

const writeSavedPapers = (papers: SavedPaper[], storage: StorageLike | null): SavedPaper[] => {
  if (!storage) return papers;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(papers));
    notify(storage);
  } catch {
    // A private session or full quota can make localStorage unavailable.
  }

  return papers;
};

export function savePaper(
  paper: Paper,
  storage: StorageLike | null = browserStorage(),
): SavedPaper[] {
  const savedPaper = { ...paper, savedAt: new Date().toISOString() };
  const papers = readSavedPapers(storage).filter((candidate) => candidate.id !== paper.id);
  return writeSavedPapers([savedPaper, ...papers], storage);
}

export function removeSavedPaper(
  id: string,
  storage: StorageLike | null = browserStorage(),
): SavedPaper[] {
  return writeSavedPapers(
    readSavedPapers(storage).filter((paper) => paper.id !== id),
    storage,
  );
}

export function toggleSavedPaper(
  paper: Paper,
  storage: StorageLike | null = browserStorage(),
): SavedPaper[] {
  return readSavedPapers(storage).some((candidate) => candidate.id === paper.id)
    ? removeSavedPaper(paper.id, storage)
    : savePaper(paper, storage);
}

export function subscribeSavedPapers(listener: (papers: SavedPaper[]) => void): () => void {
  if (!('document' in globalThis)) return () => {};

  const update = () => listener(readSavedPapers());
  const storageUpdate = (event: Event) => {
    if ('key' in event && event.key === STORAGE_KEY) update();
  };

  globalThis.addEventListener(CHANGE_EVENT, update);
  globalThis.addEventListener('storage', storageUpdate);
  update();

  return () => {
    globalThis.removeEventListener(CHANGE_EVENT, update);
    globalThis.removeEventListener('storage', storageUpdate);
  };
}
