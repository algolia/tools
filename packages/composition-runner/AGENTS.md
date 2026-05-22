# AGENTS.md — composition-runner

## Critical rule

**Every contribution to this package MUST run without error:**

From `packages/composition-runner/`:

```sh
yarn run build
yarn run lint
```

Don't open a PR, request review, or mark a task done if either fails. Fix the underlying issue — no `--no-verify`, no disabling lint rules to make output green. The repo root also declares a `yarn test` script that calls jest, but jest isn't currently installed as a workspace dependency; treat that as a no-op until someone wires it in at the root.

> Don't run lint from the repo root. The Lerna fan-out reformats every package's source via `vue-cli-service lint --fix`, leaving hundreds of cosmetic diffs in tools you never touched.

## Docs as part of the contract

Treat the spec and the docs as code. A contribution that drifts them from the implementation isn't done:

- **`./ui-layout.txt`** is the UI source of truth. **Update it FIRST** when changing the UI — state diagrams, layouts, copy, validation rules.
- **`./README.md`** is the "how do I run this locally" surface — update it when the Node version, install/build/lint commands, or credential setup change.
- **This file (`AGENTS.md`)** is itself part of the contract — update it when build/lint commands change, when design tokens are added, or when another doc file becomes a source of truth.

## Design tokens

Two CSS custom properties live on `:root` in `App.vue`:

- `--cr-mono` — the monospace font stack (objectID chips, JSON modal, set-index counter).
- `--cr-saturn-1` — `#ec8b63`, the palette's `saturn-1` (smart-group pill background, injected-card inset border).

Before adding a new hex code or font stack, check whether one of these already covers it. If a new token is genuinely needed, add it on `:root` with the `--cr-` prefix and consume via `var(--cr-…)`.

For non-token styling, prefer existing Tailwind classes (`text-telluric-blue`, `bg-saturn-1`, etc. — full palette in `packages/css/definitions/brand-colors.js`). No new colours.
