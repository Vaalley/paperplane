import {
  readSavedPapers,
  removeSavedPaper,
  savePaper,
  type StorageLike,
  toggleSavedPaper,
} from '../src/lib/client/saved-papers.ts';
import type { Paper } from '../src/lib/papers/types.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
};

const memoryStorage = (): StorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

const paper: Paper = {
  id: '2401.12345v2',
  title: 'A paper',
  summary: 'An abstract',
  authors: ['Ada Lovelace'],
  published: '2024-01-31T10:00:00Z',
  updated: '2024-02-02T12:00:00Z',
  abstractUrl: 'https://arxiv.org/abs/2401.12345v2',
  pdfUrl: 'https://arxiv.org/pdf/2401.12345v2',
  categories: ['cs.AI'],
  primaryCategory: 'cs.AI',
  comment: null,
  journalReference: null,
  doi: null,
  versions: [],
};

Deno.test('saves, replaces, and removes paper metadata', () => {
  const storage = memoryStorage();

  assertEquals(savePaper(paper, storage).map(({ id }) => id), [paper.id]);
  assertEquals(savePaper({ ...paper, title: 'Updated title' }, storage).length, 1);
  assertEquals(readSavedPapers(storage)[0].title, 'Updated title');
  assertEquals(removeSavedPaper(paper.id, storage), []);
});

Deno.test('toggles papers and ignores malformed persisted data', () => {
  const storage = memoryStorage();

  assertEquals(toggleSavedPaper(paper, storage).length, 1);
  assertEquals(toggleSavedPaper(paper, storage).length, 0);
  storage.setItem('paperplane:saved-papers:v1', '{not-json');
  assertEquals(readSavedPapers(storage), []);
});

Deno.test('migrates saved paper metadata from the original local format', () => {
  const storage = memoryStorage();
  const {
    primaryCategory: _primaryCategory,
    comment: _comment,
    journalReference: _journalReference,
    doi: _doi,
    versions: _versions,
    ...legacyPaper
  } = paper;
  storage.setItem(
    'paperplane:saved-papers:v1',
    JSON.stringify([{ ...legacyPaper, savedAt: '2024-02-03T00:00:00Z' }]),
  );

  const migrated = readSavedPapers(storage)[0];
  assertEquals(migrated.primaryCategory, null);
  assertEquals(migrated.versions, []);
});
