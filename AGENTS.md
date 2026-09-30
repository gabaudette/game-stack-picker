# Repository rules

Use Bun for dependency management and all project scripts. Use the supplied Biome 2.5.10 configuration; do not add ESLint or Prettier or weaken the configured rules.

Use TypeScript `type` declarations rather than `interface`. Do not use `any`, TypeScript enums, unsafe assertions, non-null assertions, code comments, or silent error handling. Validate external data and provide actionable errors. Use `for...of` rather than `.forEach()`. Use `Map` when keyed lookups benefit from it.

Favor composition over inheritance. Apply SOLID and DRY pragmatically without speculative abstractions. Every React component file must contain at most 300 lines; split responsibilities into focused components and hooks.

Use nuqs for shareable configuration URLs. Source tool SVG logos from SVGL first and official websites second. Preserve attribution and licensing. Use a monogram only when an SVG is unavailable. Ask the user about any unresolved uncertainty that affects implementation. If an additional design skill is needed, ask how the user can provide it.

Use Vitest and Playwright for tests. Run `bun run verify` before requesting merge. Never ignore a failed check.

Create a GitHub issue before starting a task. Work on an issue branch, open a PR into `dev`, and wait for user review before merging. Close the issue after that PR merges. Release through a reviewed PR from `dev` into `main`. Vercel production follows `main`; never deploy an unreviewed branch to production.
