import { type Paper, searchArxiv } from '$lib/server/arxiv/index.ts';
// deno-lint-ignore no-sloppy-imports -- SvelteKit generates this virtual module.
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q')?.trim() ?? '';

  if (!query) {
    return { query, papers: [] as Paper[], error: null as string | null };
  }

  try {
    const response = await searchArxiv(query, {}, fetch);
    return { query, papers: response.papers, error: null as string | null };
  } catch (error) {
    console.error(error);
    return {
      query,
      papers: [] as Paper[],
      error: 'Paperplane could not reach arXiv right now. Please try again.',
    };
  }
};
