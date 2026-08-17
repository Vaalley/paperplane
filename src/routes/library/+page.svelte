<script lang="ts">
  import {
    removeSavedPaper,
    subscribeSavedPapers,
    type SavedPaper
  } from '$lib/client/saved-papers.ts';
  import { onMount } from 'svelte';

  let papers: SavedPaper[] = $state([]);
  let ready = $state(false);

  onMount(() =>
    subscribeSavedPapers((savedPapers) => {
      papers = savedPapers;
      ready = true;
    })
  );

  const remove = (id: string) => {
    papers = removeSavedPaper(id);
  };

  const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
</script>

<svelte:head>
  <title>Library · Paperplane</title>
  <meta name="description" content="Your locally saved arXiv reading list." />
</svelte:head>

<div class="min-h-screen">
  <header class="border-b border-black/8 bg-white/75 backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-3 font-semibold tracking-tight">
        <span class="grid size-9 place-items-center rounded-xl bg-neutral-950 text-white">↗</span>
        <span>Paperplane</span>
      </a>
      <a href="/" class="text-sm text-neutral-500 transition hover:text-neutral-950">Search papers</a>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18">
    <div class="max-w-3xl">
      <p class="text-sm font-medium text-neutral-500">Local-first reading list</p>
      <div class="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 class="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">Your library</h1>
        {#if ready && papers.length > 0}
          <p class="text-sm text-neutral-400">{papers.length} saved</p>
        {/if}
      </div>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
        Papers are stored only in this browser. No account, syncing, or backend required.
      </p>
    </div>

    {#if !ready}
      <p class="mt-12 text-neutral-500">Loading your library…</p>
    {:else if papers.length === 0}
      <section class="mt-12 rounded-3xl border border-dashed border-black/15 bg-white/60 p-8 sm:p-12">
        <p class="text-sm font-medium text-neutral-400">Nothing saved yet</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">Build a calmer reading queue.</h2>
        <p class="mt-3 max-w-xl leading-7 text-neutral-600">
          Save papers from search results or paper pages and they will appear here, even after a refresh.
        </p>
        <a href="/" class="mt-6 inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
          Find papers
        </a>
      </section>
    {:else}
      <section class="mt-12 grid gap-3" aria-label="Saved papers">
        {#each papers as paper (paper.id)}
          <article class="rounded-2xl border border-black/8 bg-white p-5 sm:p-6">
            <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 max-w-4xl">
                <div class="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  {#if paper.published}<span>{formatDate(paper.published)}</span>{/if}
                  <span>arXiv:{paper.id}</span>
                  {#each paper.categories.slice(0, 2) as category}
                    <span class="rounded-full bg-neutral-100 px-2 py-1">{category}</span>
                  {/each}
                </div>
                <h2 class="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-neutral-950">
                  <a href={`/paper/${encodeURIComponent(paper.id)}`} class="hover:underline">
                    {paper.title || 'Title unavailable'}
                  </a>
                </h2>
                <p class="mt-2 text-sm text-neutral-500">
                  {paper.authors.length > 0 ? paper.authors.join(', ') : 'Author information unavailable'}
                </p>
                <p class="mt-4 line-clamp-3 text-sm leading-6 text-neutral-600">{paper.summary}</p>
              </div>
              <button
                type="button"
                onclick={() => remove(paper.id)}
                aria-label={`Remove ${paper.title} from library`}
                class="shrink-0 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                Remove
              </button>
            </div>
          </article>
        {/each}
      </section>
    {/if}
  </main>
</div>
