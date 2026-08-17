<script lang="ts">
  import { page } from '$app/state';

  const heading = $derived(
    page.status === 404 ? 'Paper not found' : page.status === 400 ? 'Invalid paper ID' : 'arXiv is unavailable'
  );
</script>

<svelte:head>
  <title>{heading} · Paperplane</title>
</svelte:head>

<div class="grid min-h-screen place-items-center px-5 py-16">
  <main class="w-full max-w-xl rounded-3xl border border-black/8 bg-white p-8 text-center shadow-sm sm:p-12">
    <a href="/" class="mx-auto grid size-11 place-items-center rounded-xl bg-neutral-950 text-white">↗</a>
    <p class="mt-8 text-sm font-medium text-neutral-400">Error {page.status}</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-[-0.035em] text-neutral-950">{heading}</h1>
    <p class="mx-auto mt-4 max-w-md leading-7 text-neutral-600">
      {page.error?.message || 'Paperplane could not load this paper.'}
    </p>
    <a
      href="/"
      class="mt-8 inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white outline-none transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
    >
      Search for a paper
    </a>
  </main>
</div>
