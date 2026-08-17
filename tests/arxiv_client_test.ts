import { getArxivPaper, searchArxiv } from '../src/lib/server/arxiv/client.ts';

const feedFixture = await Deno.readTextFile(
  new URL('./fixtures/representative-feed.xml', import.meta.url),
);
const historyFixture = await Deno.readTextFile(
  new URL('./fixtures/version-history.html', import.meta.url),
);

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
};

Deno.test('fetches one paper by normalized arXiv ID', async () => {
  const requestUrls: string[] = [];
  const fetcher = ((input: string | URL | Request) => {
    const requestUrl = new URL(input instanceof Request ? input.url : input).href;
    requestUrls.push(requestUrl);
    return Promise.resolve(
      new Response(requestUrl.startsWith('https://arxiv.org/abs/') ? historyFixture : feedFixture, {
        status: 200,
      }),
    );
  }) as typeof fetch;

  const paper = await getArxivPaper('arXiv:2401.12345v2', fetcher);

  assertEquals(paper?.id, '2401.12345v2');
  assertEquals(paper?.versions, [
    { version: 1, submitted: 'Wed, 31 Jan 2024 10:00:00 UTC', size: '512 KB' },
    { version: 2, submitted: 'Fri, 2 Feb 2024 12:00:00 UTC', size: '520 KB' },
  ]);
  assertEquals(new URL(requestUrls[0]).searchParams.get('id_list'), '2401.12345v2');
  assertEquals(new URL(requestUrls[0]).searchParams.get('max_results'), '1');
  assertEquals(requestUrls[1], 'https://arxiv.org/abs/2401.12345v2');
});

Deno.test('rejects an invalid ID without requesting arXiv', async () => {
  let requested = false;
  const fetcher = (() => {
    requested = true;
    throw new Error('should not fetch');
  }) as typeof fetch;

  assertEquals(await getArxivPaper('../not-an-id', fetcher), null);
  assertEquals(requested, false);
});

Deno.test('maps search filters, sorting, and pagination to arXiv parameters', async () => {
  let requestUrl = '';
  const fetcher = ((input: string | URL | Request) => {
    requestUrl = new URL(input instanceof Request ? input.url : input).href;
    return Promise.resolve(new Response(feedFixture, { status: 200 }));
  }) as typeof fetch;

  await searchArxiv(
    'graph neural networks',
    {
      start: 12,
      maxResults: 12,
      sortBy: 'submittedDate',
      sortOrder: 'ascending',
      category: 'cs.LG',
      fromDate: '2024-01-01',
      toDate: '2024-12-31',
    },
    fetcher,
  );

  const params = new URL(requestUrl).searchParams;
  assertEquals(
    params.get('search_query'),
    'all:graph neural networks AND cat:cs.LG AND submittedDate:[202401010000 TO 202412312359]',
  );
  assertEquals(params.get('start'), '12');
  assertEquals(params.get('max_results'), '12');
  assertEquals(params.get('sortBy'), 'submittedDate');
  assertEquals(params.get('sortOrder'), 'ascending');
});
