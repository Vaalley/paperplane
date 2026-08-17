<script lang="ts">
  import SearchControls from '$lib/components/SearchControls.svelte';
  import SaveButton from '$lib/components/SaveButton.svelte';

  let { data } = $props();

  const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
      date
    );
  };
</script>

<svelte:head>
  <title>{data.query ? `${data.query} · Paperplane` : 'Paperplane · Research, without the friction'}</title>
  <meta
    name="description"
    content="A fast, modern interface for discovering and reading research from arXiv."
  />
</svelte:head>

<div class="min-h-screen">
  <header class="border-b border-black/8 bg-white/75 backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
      <a href="/" class="flex items-center gap-3 font-semibold tracking-tight">
        <span class="grid size-9 place-items-center rounded-xl bg-neutral-950 text-white">↗</span>
        <span>Paperplane</span>
      </a>
      <nav class="flex items-center gap-4 text-sm text-neutral-500" aria-label="Primary navigation">
        <a href="/library" class="transition hover:text-neutral-950">Library</a>
        <a href="https://arxiv.org" target="_blank" rel="noreferrer" class="transition hover:text-neutral-950">
          arXiv ↗
        </a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
    <section class="max-w-3xl">
      <p class="mb-4 text-sm font-medium text-neutral-500">Research, without the friction.</p>
      <h1 class="text-5xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-7xl">
        Find the paper.<br />Skip the archaeology.
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
        Search arXiv through a cleaner, calmer interface built for discovering papers instead of
        wrestling with them.
      </p>

      <SearchControls
        query={data.query}
        sort={data.sort}
        category={data.category}
        fromDate={data.fromDate}
        toDate={data.toDate}
      />
    </section>

    {#if data.error}
      <div class="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        {data.error}
      </div>
    {/if}

    {#if data.query && !data.error}
      <section class="mt-14">
        <div class="mb-5 flex items-end justify-between gap-4">
          <div>
            <p class="text-sm text-neutral-500">Results for</p>
            <h2 class="mt-1 text-2xl font-semibold tracking-tight">“{data.query}”</h2>
          </div>
          <span class="text-right text-sm text-neutral-400">
            {#if data.totalResults > 0}
              {Math.min((data.page - 1) * data.pageSize + 1, data.totalResults)}–{Math.min(
                data.page * data.pageSize,
                data.totalResults
              )} of {data.totalResults.toLocaleString()}
            {:else}
              0 results
            {/if}
          </span>
        </div>

        {#if data.papers.length === 0}
          <div class="rounded-2xl border border-black/8 bg-white p-8 text-neutral-500">
            {data.page > 1 ? 'No papers are available on this page.' : 'No papers found. Try broader filters.'}
          </div>
        {:else}
          <div class="grid gap-3">
            {#each data.papers as paper}
              <article
                class="group rounded-2xl border border-black/8 bg-white p-5 transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-lg hover:shadow-black/5 sm:p-6"
              >
                <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0 max-w-4xl">
                    <div class="mb-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span>{formatDate(paper.published)}</span>
                      <span>·</span>
                      <span>{paper.id}</span>
                      {#each paper.categories.slice(0, 2) as category}
                        <span class="rounded-full bg-neutral-100 px-2 py-1">{category}</span>
                      {/each}
                    </div>
                    <h3 class="text-xl font-semibold leading-snug tracking-[-0.02em] text-neutral-950">
                      <a
                        href={`/paper/${encodeURIComponent(paper.id)}`}
                        class="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
                      >
                        {paper.title}
                      </a>
                    </h3>
                    <p class="mt-2 text-sm text-neutral-500">
                      {paper.authors.slice(0, 5).join(', ')}{paper.authors.length > 5 ? ' et al.' : ''}
                    </p>
                    <p class="mt-4 line-clamp-3 text-sm leading-6 text-neutral-600">{paper.summary}</p>
                  </div>

                  <div class="flex shrink-0 flex-wrap gap-2">
                    <SaveButton {paper} compact />
                    <a
                      href={paper.abstractUrl}
                      target="_blank"
                      rel="noreferrer"
                      class="rounded-xl border border-black/10 px-3 py-2 text-sm transition hover:bg-neutral-50"
                    >
                      Abstract
                    </a>
                    {#if paper.pdfUrl}
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        class="rounded-xl bg-neutral-950 px-3 py-2 text-sm text-white transition hover:bg-neutral-800"
                      >
                        PDF ↗
                      </a>
                    {/if}
                  </div>
                </div>
              </article>
            {/each}
          </div>
        {/if}

        {#if data.previousUrl || data.nextUrl}
          <nav class="mt-8 flex items-center justify-between gap-4" aria-label="Search result pages">
            {#if data.previousUrl}
              <a
                href={data.previousUrl}
                rel="prev"
                class="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                ← Previous
              </a>
            {:else}
              <span></span>
            {/if}

            <span class="text-sm text-neutral-500">
              Page {data.page}{data.totalPages > 0 ? ` of ${data.totalPages.toLocaleString()}` : ''}
            </span>

            {#if data.nextUrl}
              <a
                href={data.nextUrl}
                rel="next"
                class="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                Next →
              </a>
            {:else}
              <span></span>
            {/if}
          </nav>
        {/if}
      </section>
    {/if}
  </main>
</div>
