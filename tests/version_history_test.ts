import { parseArxivVersionHistory } from '../src/lib/server/arxiv/version-history.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
};

Deno.test('parses arXiv submission history without author details or markup', async () => {
  const html = await Deno.readTextFile(
    new URL('./fixtures/version-history.html', import.meta.url),
  );

  assertEquals(parseArxivVersionHistory(html), [
    { version: 1, submitted: 'Wed, 31 Jan 2024 10:00:00 UTC', size: '512 KB' },
    { version: 2, submitted: 'Fri, 2 Feb 2024 12:00:00 UTC', size: '520 KB' },
  ]);
  assertEquals(parseArxivVersionHistory('<html></html>'), []);
});
