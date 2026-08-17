<script lang="ts">
  let { text, label }: { text: string; label: string } = $props();
  let status = $state<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await globalThis.navigator.clipboard.writeText(text);
      status = 'copied';
    } catch {
      status = 'failed';
    }

    globalThis.setTimeout(() => {
      status = 'idle';
    }, 2000);
  };
</script>

<button
  type="button"
  onclick={copy}
  class="rounded-xl border border-black/10 px-4 py-3 text-sm font-medium outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
>
  {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : label}
</button>
