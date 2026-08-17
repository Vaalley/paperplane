# AGENTS.md

## Project

Paperplane is a modern frontend for arXiv built with SvelteKit, Svelte 5, TypeScript, Tailwind CSS
4, and Deno-managed tooling.

Read `SPECS.md` before implementing product work.

## Developer workflow

Use Deno by default:

```bash
deno install
deno task dev
deno task check
deno task build
deno task fmt
deno task lint
```

Do not introduce npm/pnpm/yarn lockfiles. `deno.lock` is the project lockfile.

## Implementation rules

- Prefer small, composable Svelte components once a route becomes complex.
- Keep external API access in server-side modules/routes.
- Keep arXiv-specific parsing and types isolated from UI code as the codebase grows.
- Use TypeScript strictly. Avoid `any` unless an external boundary makes it unavoidable and document
  why.
- Preserve URL-addressable state for search, filters, sorting, and pagination.
- Build accessible controls with keyboard and screen-reader behavior.
- Treat mobile layouts as first-class.
- Avoid dependencies for trivial utilities.
- Do not add auth, databases, analytics, or AI providers unless the assigned issue explicitly
  requires them.

## Product rules

- arXiv remains the canonical source. Always retain canonical abstract/PDF links.
- Never fabricate scholarly metadata.
- Prefer useful metadata over decorative UI.
- AI functionality must remain optional and visually secondary to the paper itself.

## Before finishing a task

Run, at minimum:

```bash
deno task check
deno task build
```

Also run `deno task lint` and `deno task fmt --check` when applicable. Document any check that
cannot be run and why.

## Git / PR guidance

- Keep PRs scoped to one issue or cohesive feature.
- Include screenshots for meaningful UI changes when possible.
- Explain user-facing behavior and testing in the PR description.
- Do not silently refactor unrelated code while implementing a ticket.
