<script lang="ts">
  import { formatBibtex, formatCitation } from '$lib/papers/citations.ts';
  import type { Paper } from '$lib/papers/types.ts';
  import CopyButton from './CopyButton.svelte';

  let { paper }: { paper: Paper } = $props();
</script>

<div class="flex flex-wrap gap-2">
  <CopyButton text={formatCitation(paper)} label="Copy citation" />
  <CopyButton text={formatBibtex(paper)} label="Copy BibTeX" />
</div>
