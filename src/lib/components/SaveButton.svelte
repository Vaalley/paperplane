<script lang="ts">
  import { subscribeSavedPapers, toggleSavedPaper } from '$lib/client/saved-papers.ts';
  import type { Paper } from '$lib/papers/types.ts';
  import { onMount } from 'svelte';

  let { paper, compact = false }: { paper: Paper; compact?: boolean } = $props();
  let saved = $state(false);

  onMount(() =>
    subscribeSavedPapers((papers) => {
      saved = papers.some((candidate) => candidate.id === paper.id);
    })
  );

  const toggle = () => {
    saved = toggleSavedPaper(paper).some((candidate) => candidate.id === paper.id);
  };
</script>

<button
  type="button"
  aria-pressed={saved}
  aria-label={saved ? `Remove ${paper.title} from library` : `Save ${paper.title} to library`}
  onclick={toggle}
  class={compact
    ? 'rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-950'
    : 'rounded-xl border border-black/10 px-4 py-3 text-center text-sm font-medium outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'}
>
  <span aria-hidden="true">{saved ? '★' : '☆'}</span>
  {saved ? 'Saved' : 'Save'}
</button>
