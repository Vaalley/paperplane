# Paperplane Product Spec

## Vision

Paperplane is a modern, fast, reading-first frontend for arXiv. It should make discovering, evaluating, saving, and reading research feel closer to a polished modern knowledge tool than a repository index.

## Principles

1. **Fast by default.** Search and navigation should feel immediate.
2. **Research-first UI.** Titles, authors, abstracts, figures, versions, and citations matter more than chrome.
3. **Progressive complexity.** The basic experience stays simple; advanced filters and metadata appear when needed.
4. **Respect arXiv.** Paperplane is a client, not a replacement archive. Preserve canonical links and attribution.
5. **No AI wallpaper.** AI features are optional tools, never required to use the product.

## v0.1 MVP

### Search
- Query arXiv from Paperplane.
- Show title, authors, publication date, categories, abstract preview, arXiv ID, and PDF link.
- Preserve query in the URL.
- Good loading, empty, and error states.

### Paper page
- Native `/paper/[id]` route.
- Full abstract and metadata.
- Version history.
- Primary category and all categories.
- Canonical arXiv and PDF links.
- Copy citation / BibTeX actions.

### Discovery
- Sort by relevance, newest, oldest.
- Filter by category and date range.
- Pagination.

### Saved papers
- Local-first saved collection using IndexedDB/local storage initially.
- No account required.
- Saved state visible from search and paper pages.

### Reader
- First iteration may embed or link the canonical PDF.
- Later iteration should provide a dedicated distraction-free reader shell.

## Later milestones

- Author pages and following.
- Topic feeds.
- Collections and tags.
- Citation graph / related papers via external scholarly metadata sources.
- Offline saved metadata and selected PDFs.
- Optional paper summarization, section explanations, notation help, and paper comparison.
- Accounts and sync only once the local-first workflow is excellent.

## Non-goals for v0.1

- Rehosting the entire arXiv corpus.
- Building a citation index from scratch.
- Social comments or public profiles.
- Mandatory login.
- AI-generated summaries in primary search results.

## Technical direction

- SvelteKit + Svelte 5 + TypeScript.
- Tailwind CSS 4.
- Deno as package/task manager where compatible with the Svelte/Vite ecosystem.
- Keep `package.json` because SvelteKit/Vite are npm ecosystem tools; use `deno install` and `deno task` for the normal developer workflow.
- Server-side calls to arXiv to avoid browser CORS inconsistencies and centralize parsing/caching.
- Add persistent infrastructure only when a feature requires it.

## UX direction

Paperplane should feel editorial, calm, and information-dense without becoming cramped. Prefer strong typography, generous spacing, subtle borders, and minimal ornament. Avoid dashboard clutter and excessive gradients.
