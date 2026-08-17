import { getArxivPaper } from '../src/lib/server/arxiv/client.ts';

const fixture = await Deno.readTextFile(
  new URL('./fixtures/representative-feed.xml', import.meta.url),
);

const assertEquals = (actual: unknown, expected: unknown) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
};

Deno.test('fetches one paper by normalized arXiv ID', async () => {
  let requestUrl = '';
  const fetcher = ((input: string | URL | Request) => {
    requestUrl = new URL(input instanceof Request ? input.url : input).href;
    return Promise.resolve(new Response(fixture, { status: 200 }));
  }) as typeof fetch;

  const paper = await getArxivPaper('arXiv:2401.12345v2', fetcher);

  assertEquals(paper?.id, '2401.12345v2');
  assertEquals(new URL(requestUrl).searchParams.get('id_list'), '2401.12345v2');
  assertEquals(new URL(requestUrl).searchParams.get('max_results'), '1');
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
