import { parseArxivFeed } from '../src/lib/server/arxiv/parser.ts';

const fixture = (name: string) => Deno.readTextFile(new URL(`./fixtures/${name}`, import.meta.url));

const assertEquals = (actual: unknown, expected: unknown) => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, received ${actualJson}`);
  }
};

Deno.test('parses feed metadata, authors, categories, entities, and link attributes', async () => {
  const result = parseArxivFeed(await fixture('representative-feed.xml'));

  assertEquals(result.totalResults, 42);
  assertEquals(result.startIndex, 10);
  assertEquals(result.itemsPerPage, 2);
  assertEquals(result.papers.length, 2);
  assertEquals(result.papers[0], {
    id: '2401.12345v2',
    title: 'A & B: α representative paper',
    summary: 'First line. Second <line>.',
    authors: ['Ada Lovelace', 'Alan Turing'],
    published: '2024-01-31T10:00:00Z',
    updated: '2024-02-02T12:00:00Z',
    abstractUrl: 'https://arxiv.org/abs/2401.12345v2',
    pdfUrl: 'https://arxiv.org/pdf/2401.12345v2',
    categories: ['cs.AI', 'cs.LG'],
    primaryCategory: 'cs.AI',
    comment: 'Accepted at ExampleConf 2024',
    journalReference: 'Journal of Representative Research 1 (2024)',
    doi: '10.1000/example.123',
    versions: [],
  });
  assertEquals(result.papers[1].id, 'hep-th/9901001v1');
  assertEquals(result.papers[1].title, 'Legacy identifier');
});

Deno.test('skips entries without a valid ID and represents missing fields explicitly', async () => {
  const result = parseArxivFeed(await fixture('malformed-feed.xml'));

  assertEquals(result.totalResults, 0);
  assertEquals(result.papers.length, 1);
  assertEquals(result.papers[0], {
    id: '2307.00001',
    title: 'Minimal paper',
    summary: '',
    authors: [],
    published: null,
    updated: null,
    abstractUrl: 'https://arxiv.org/abs/2307.00001',
    pdfUrl: null,
    categories: [],
    primaryCategory: null,
    comment: null,
    journalReference: null,
    doi: null,
    versions: [],
  });
});
