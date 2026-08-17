# Paperplane

A fast, modern interface for discovering and reading research from arXiv.

Paperplane's v0.1 experience includes:

- arXiv search with URL-addressable sorting, category and date filters, and pagination
- native paper pages with complete metadata, submission history, and canonical links
- one-click plain-text and BibTeX citations
- a local-first saved library with no account required
- responsive, accessible loading, empty, and error states

## Stack

- SvelteKit
- Svelte 5
- TypeScript
- Tailwind CSS 4
- Deno for task running and dependency management where practical
- arXiv API

## Development

```bash
deno install
deno task dev
```

## Validation

```bash
deno task test
deno task lint
deno task check
deno task build
deno task fmt --check
```

See `SPECS.md` for product scope and `AGENTS.md` for contributor/Codex guidance.
