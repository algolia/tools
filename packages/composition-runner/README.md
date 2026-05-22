# composition-runner

Send queries to Algolia's [Composition API](https://www.algolia.com/doc/rest-api/composition)
and inspect the result sets it returns.

## Prerequisites

- **Node 18.x** — the repo pins this via `.tool-versions` and `package.json#engines`. `mise` and `nvm` both auto-select the right version from `.tool-versions`.
- **Yarn 1.x classic** — the repo is a Yarn workspaces monorepo.

## First-time setup

From the **repo root** (`tools/`), install all workspace dependencies:

```sh
yarn install
```

Build the shared CSS once so the tool inherits the monorepo's styling:

```sh
yarn prepare-css
```

## Run the dev server

From this package directory (`packages/composition-runner/`):

```sh
yarn serve
```

The Vue CLI dev server prints the local URL (typically `http://localhost:8080`).

## Add credentials

There are **no env vars** for Algolia credentials. Open the dev URL, click the **AppIDs** button in the top-right of the page header, and add an App ID + API key there. The same panel feeds every tool in the monorepo, so credentials added here are reused elsewhere (and vice versa).

ACLs you'll need on the key:

- `search` — **required** to run compositions.
- `settings` — *optional*; enables the Composition ID dropdown. Without it, the field gracefully degrades to a free-text input.

## Build for production

```sh
yarn build
```

## Lint

```sh
yarn lint
```

(Auto-fixes formatting on save. Don't run from the repo root — that fans out to every package via Lerna and reformats unrelated files.)

## Learn more

- [`./ui-layout.txt`](./ui-layout.txt) — UI spec; source of truth for layout, behaviour, and copy. Update this **before** changing the corresponding code.
- [`./AGENTS.md`](./AGENTS.md) — contribution contract (build/lint must pass, docs-as-code rules).
