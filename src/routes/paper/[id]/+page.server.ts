import { getArxivPaper, normalizeArxivId } from '$lib/server/arxiv/index.ts';
import { error } from '@sveltejs/kit';

// deno-lint-ignore no-sloppy-imports -- SvelteKit generates this virtual module.
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const id = normalizeArxivId(params.id);
  if (!id) error(400, 'That arXiv identifier is not valid.');

  let paper;
  try {
    paper = await getArxivPaper(id, fetch);
  } catch (cause) {
    console.error(cause);
    error(502, 'Paperplane could not reach arXiv right now. Please try again.');
  }

  if (!paper) error(404, 'No arXiv paper was found for that identifier.');
  return { paper };
};
