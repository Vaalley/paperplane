<script lang="ts">
  import CitationActions from '$lib/components/CitationActions.svelte';
  import SaveButton from '$lib/components/SaveButton.svelte';

  let { data } = $props();

  const formatDate = (value: string | null) => {
    if (!value) return 'Not provided';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
</script>

<svelte:head>
  <title>{data.paper.title || data.paper.id} · Paperplane</title>
  <meta
    name="description"
    content={data.paper.summary || `Read ${data.paper.id} on Paperplane.`}
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
        <a href="/library" class="rounded-lg outline-none transition hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950">
          Library
        </a>
        <a href="/" class="rounded-lg outline-none transition hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950">
          Search
        </a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
    <a
      href="/"
      class="inline-flex rounded-lg text-sm text-neutral-500 outline-none transition hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
    >
      ← Back to search
    </a>

    <div class="mt-9 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
      <article class="min-w-0">
        <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <span class="font-medium text-neutral-700">arXiv:{data.paper.id}</span>
          {#if data.paper.primaryCategory}
            <span class="rounded-full bg-neutral-950 px-2.5 py-1 text-white">
              Primary · {data.paper.primaryCategory}
            </span>
          {/if}
          {#each data.paper.categories.filter((category) => category !== data.paper.primaryCategory).slice(0, 2) as category}
            <span class="rounded-full bg-white px-2.5 py-1 ring-1 ring-black/8">{category}</span>
          {/each}
        </div>

        <h1 class="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-neutral-950 sm:text-6xl">
          {data.paper.title || 'Title unavailable'}
        </h1>

        <p class="mt-6 text-base leading-7 text-neutral-600 sm:text-lg">
          {data.paper.authors.length > 0
            ? data.paper.authors.join(', ')
            : 'Author information unavailable'}
        </p>

        <section class="mt-12 border-t border-black/10 pt-8" aria-labelledby="abstract-heading">
          <p class="text-sm font-medium uppercase tracking-[0.16em] text-neutral-400">Abstract</p>
          <h2 id="abstract-heading" class="sr-only">Abstract</h2>
          <p class="mt-5 whitespace-pre-line text-lg leading-8 text-neutral-700">
            {data.paper.summary || 'No abstract was provided by arXiv for this record.'}
          </p>
        </section>

        <section class="mt-12 border-t border-black/10 pt-8" aria-labelledby="citation-heading">
          <h2 id="citation-heading" class="text-sm font-medium uppercase tracking-[0.16em] text-neutral-400">
            Cite this paper
          </h2>
          <div class="mt-4">
            <CitationActions paper={data.paper} />
          </div>
        </section>

        {#if data.paper.versions.length > 0}
          <section class="mt-12 border-t border-black/10 pt-8" aria-labelledby="versions-heading">
            <h2 id="versions-heading" class="text-sm font-medium uppercase tracking-[0.16em] text-neutral-400">
              Version history
            </h2>
            <ol class="mt-4 divide-y divide-black/8 rounded-2xl border border-black/8 bg-white px-5">
              {#each [...data.paper.versions].reverse() as version}
                <li class="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 py-4 text-sm">
                  <span class="font-medium text-neutral-800">Version {version.version}</span>
                  <span class="text-neutral-500">
                    {version.submitted}{version.size ? ` · ${version.size}` : ''}
                  </span>
                </li>
              {/each}
            </ol>
          </section>
        {/if}

        {#if data.paper.categories.length > 0}
          <section class="mt-12 border-t border-black/10 pt-8" aria-labelledby="categories-heading">
            <h2 id="categories-heading" class="text-sm font-medium uppercase tracking-[0.16em] text-neutral-400">
              Categories
            </h2>
            <div class="mt-4 flex flex-wrap gap-2">
              {#each data.paper.categories as category}
                <span class="rounded-full bg-white px-3 py-1.5 text-sm text-neutral-700 ring-1 ring-black/8">
                  {category}
                </span>
              {/each}
            </div>
          </section>
        {/if}
      </article>

      <aside class="rounded-2xl border border-black/8 bg-white p-5 shadow-sm lg:sticky lg:top-6">
        <div class="grid gap-5 text-sm">
          <div>
            <p class="text-neutral-400">Published</p>
            <p class="mt-1 font-medium text-neutral-800">{formatDate(data.paper.published)}</p>
          </div>
          <div>
            <p class="text-neutral-400">Last updated</p>
            <p class="mt-1 font-medium text-neutral-800">{formatDate(data.paper.updated)}</p>
          </div>
          <div>
            <p class="text-neutral-400">Identifier</p>
            <p class="mt-1 break-all font-mono text-xs text-neutral-700">{data.paper.id}</p>
          </div>
          {#if data.paper.comment}
            <div>
              <p class="text-neutral-400">Comment</p>
              <p class="mt-1 text-neutral-700">{data.paper.comment}</p>
            </div>
          {/if}
          {#if data.paper.journalReference}
            <div>
              <p class="text-neutral-400">Journal reference</p>
              <p class="mt-1 text-neutral-700">{data.paper.journalReference}</p>
            </div>
          {/if}
          {#if data.paper.doi}
            <div>
              <p class="text-neutral-400">DOI</p>
              <a
                href={`https://doi.org/${data.paper.doi}`}
                target="_blank"
                rel="noreferrer"
                class="mt-1 block break-all text-neutral-700 underline decoration-black/20 underline-offset-4 hover:decoration-black"
              >
                {data.paper.doi}
              </a>
            </div>
          {/if}
        </div>

        <div class="mt-6 grid gap-2 border-t border-black/8 pt-5">
          <SaveButton paper={data.paper} />
          {#if data.paper.pdfUrl}
            <a
              href={data.paper.pdfUrl}
              target="_blank"
              rel="noreferrer"
              class="rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white outline-none transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
            >
              Open PDF ↗
            </a>
          {/if}
          <a
            href={data.paper.abstractUrl}
            target="_blank"
            rel="noreferrer"
            class="rounded-xl border border-black/10 px-4 py-3 text-center text-sm font-medium outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
          >
            View on arXiv ↗
          </a>
        </div>
      </aside>
    </div>
  </main>
</div>
