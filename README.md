# Loadout — Game Stack Picker

Build a game-development stack, get a curated recommendation, and share a complete configuration with your team. A client-side React + TypeScript app using Vite, Bun, nuqs, and Biome.

## Development

Use Bun 1.4.2 and Node.js 24. No API keys are needed.

```sh
bun install --frozen-lockfile
bun run dev
```

Open the localhost URL printed by Vite. Install the test browser once:

```sh
bunx playwright install chromium
```

On Linux CI, install Chromium system dependencies with `bunx playwright install --with-deps chromium`.

## Checks

```sh
bun run check
bun run typecheck
bun run test
bun run test:e2e
bun run build
bun run verify
```

`bun run format` applies Biome formatting and safe fixes. `bun run check:components` checks the 300-line limit for React component files. Vitest covers recommendations, catalog invariants, input validation, restoration, and diagram content. Playwright exercises desktop and mobile selection, guidance, sharing, navigation, persistence, real downloads, accessibility interactions, and error feedback.

The supplied Biome 2.5.10 configuration is preserved, including its overrides and exclusions. Application source lives in `src`, so the legacy `web/src` exclusions do not exclude this app. Check scripts explicitly target source and configuration paths so generated Playwright artifacts are not formatted. Bun is the sole package manager; commit `bun.lock` when dependencies change.

## Features

- 71 tools across 11 production categories, with search, free-option filtering, and vendor links.
- One primary engine, framework, or library per stack; other categories allow multiple tools and incomplete stacks.
- Eight-step guided recommendations with explanations, alternatives, and replacement confirmation.
- Compatibility notices for engine integrations, exports, stores, and console access.
- Device persistence and nuqs query parameters for shareable configuration.
- Project-prompt copying and standalone PNG/SVG diagram downloads.
- Keyboard support, responsive layout, reduced-motion support, and explicit failure feedback.

The catalog describes starting points, not an integration guarantee. Foundations are labeled as engines, frameworks, or libraries. Bevy/Rust, SFML/C++, raylib/C or Odin, SDL3, LÖVE/Lua, MonoGame/C#, and Defold/Lua complement the editor-driven workflows. Code-first suggestions include appropriate build and testing tools, separate animation authoring where needed, and optional tile-map tooling. raylib’s verified mobile route is Android; iOS stores are not automatically recommended for it. GDevelop is cataloged for its established 2D workflow; Phaser lists direct browser output only. Engine versions, SDK access, commercial terms, online architecture, and service capacity must be checked for a real project. Free tooling does not imply free hosting or publishing.

## Architecture and maintenance

`src/domain` contains the typed catalog, compatibility checks, and deterministic recommendation rules. `src/state` validates URL and stored inputs and synchronizes the configuration through nuqs. Components compose the browsing, questionnaire, summary, and export interactions; `src/exports` renders both image formats from the same diagram layout.

Add tools to `src/domain/catalog.json` with a stable ID, category, official link, cost model, and relevant platform/engine tags. Verify descriptions against official sources and update the source notes in `docs/catalog-sources.md`. Update recommendation mappings and tests when adding an engine. Do not rename existing IDs without considering saved links.

Configuration version 1 uses `v`, `picks`, `dimension`, `platforms`, `team`, `experience`, `budget`, `multiplayer`, `art`, and `engine` query keys. Picks and platforms are comma-separated stable IDs. URL configuration takes precedence over device storage. Invalid entries are reported and valid entries are recovered. An explicit empty stack does not restore old picks. Unsupported versions produce a visible notice. Store migrations and URL compatibility changes need tests before a future version bump.

SVG assets live in `src/assets/logos`, with tool-to-file mappings in `src/assets/logos.json` and provenance in `public/logos/sources.json`. Prefer SVGL, then official vendor SVGs. Both diagrams embed logos and styling; the app does not call a logo API at runtime. See [logo attribution](public/ATTRIBUTION.md).

## GitHub workflow

Create an issue before starting a task. Work on an issue branch and submit a PR into `dev`. Wait for user review before merging, then close the related issue. Release via a reviewed PR from `dev` into `main`. GitHub Actions runs `bun run verify` for PRs and pushes to both branches. See [AGENTS.md](AGENTS.md) for all repository rules.

## Vercel

The project is linked to `gabriel-audettes-projects/game-stack-picker`. Production tracks `main`; development branches use preview deployments. Keep application changes off `main` until the release PR is reviewed.

`vercel.json` specifies Bun installation, `bun run build`, the `dist` output, and SPA rewrites. Node.js 24 is configured on the Vercel project. The project skips bootstrap branches without `package.json` and rejects production builds from any Git branch other than `main`. Preview builds run normally. This guard is configured both in the project settings and `vercel.json`. A local preview can be published with `vercel deploy --yes`; do not use `--prod` on an unreviewed branch. The Vercel CLI manages its credentials outside this repository. Generated `.env.local` and `.vercel` metadata are ignored; environment files are excluded from uploads.

No accounts, backend, analytics, or paid model APIs are used.
