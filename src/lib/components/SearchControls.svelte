<script lang="ts">
  type SearchSort = 'relevance' | 'newest' | 'oldest';

  let {
    query,
    sort,
    category,
    fromDate,
    toDate
  }: {
    query: string;
    sort: SearchSort;
    category: string;
    fromDate: string;
    toDate: string;
  } = $props();

  const hasFilters = $derived(sort !== 'relevance' || Boolean(category || fromDate || toDate));
</script>

<form method="GET" class="mt-9 rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
  <div class="flex flex-col gap-2 sm:flex-row">
    <label class="sr-only" for="paper-query">Search papers</label>
    <input
      id="paper-query"
      name="q"
      value={query}
      required
      placeholder="Transformers, protein folding, quantum gravity…"
      class="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950"
    />
    <button
      type="submit"
      class="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white outline-none transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
    >
      Search
    </button>
  </div>

  <details open={hasFilters} class="group border-t border-black/8 px-2 pt-2">
    <summary
      class="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-neutral-600 outline-none hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950"
    >
      <span>Filters and sorting</span>
      <span aria-hidden="true" class="text-neutral-400 transition group-open:rotate-45">＋</span>
    </summary>

    <div class="grid gap-4 px-2 pb-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      <label class="grid gap-1.5 text-sm font-medium text-neutral-700">
        Sort by
        <select
          name="sort"
          value={sort}
          class="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </label>

      <label class="grid gap-1.5 text-sm font-medium text-neutral-700">
        Category
        <input
          name="category"
          value={category}
          list="arxiv-categories"
          placeholder="e.g. cs.AI"
          pattern="[A-Za-z]+(?:-[A-Za-z]+)*(?:\.[A-Za-z-]+)?"
          class="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2.5 font-normal outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950"
        />
        <datalist id="arxiv-categories">
          <option value="cs.AI"></option>
          <option value="cs.CL"></option>
          <option value="cs.CV"></option>
          <option value="cs.LG"></option>
          <option value="math.PR"></option>
          <option value="physics.gen-ph"></option>
          <option value="quant-ph"></option>
          <option value="stat.ML"></option>
        </datalist>
      </label>

      <label class="grid gap-1.5 text-sm font-medium text-neutral-700">
        From date
        <input
          type="date"
          name="from"
          value={fromDate}
          max={toDate || undefined}
          class="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
        />
      </label>

      <label class="grid gap-1.5 text-sm font-medium text-neutral-700">
        To date
        <input
          type="date"
          name="to"
          value={toDate}
          min={fromDate || undefined}
          class="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
        />
      </label>
    </div>

    {#if hasFilters}
      <div class="flex justify-end px-2 pb-2">
        <a href={query ? `/?q=${encodeURIComponent(query)}` : '/'} class="text-sm text-neutral-500 underline-offset-4 hover:underline">
          Clear filters
        </a>
      </div>
    {/if}
  </details>
</form>
