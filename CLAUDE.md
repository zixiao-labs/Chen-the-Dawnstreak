# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chen-the-Dawnstreak (赤刃明霄陈) is a lightweight React 19+ metaframework providing file-based routing, data-fetching hooks, form management, state management, SSR, a Vite plugin with PWA support, and a multi-platform CLI scaffolding tool. Published as `chen-the-dawnstreak` on npm.

## Build & Development

- **TypeScript compile**: `npm run build` (runs `tsc` + `chmod +x dist/cli/index.js`)
- **Tests**: `npm test` (vitest)
- **No bundler/linter** is configured — the project outputs ES modules via `tsc`
- Target: ES2020, Module: ESNext, JSX: react-jsx (automatic runtime), strict mode enabled
- Lib: ES2020 + DOM

## Architecture

### Router (`src/router/index.ts`)

A thin re-export layer over `react-router` v7. `ChenRouter` is simply `BrowserRouter` renamed. All standard react-router exports (Route, Routes, Link, NavLink, useNavigate, useParams, etc.) are re-exported.

### Data Hooks (`src/hooks/`)

- **`useFetch<T>(url, options?)`**: GET hook with AbortController cleanup, `enabled` flag for conditional fetching, and `refetch` via a counter key. Returns `{ data, loading, error, refetch }`.
- **`useMutation<TData, TVariables>(url, options?)`**: POST hook (method configurable). Auto-serializes body as JSON. Returns `{ mutate, data, loading, error, reset }`.
- **`useForm<T>(options)`**: Form state management with validation rules (required, min, max, minLength, maxLength, pattern, validate, custom). Returns `{ values, errors, touched, register, handleSubmit, ... }`.
- **`useController(form, options)`**: For controlled components that don't use standard onChange.
- **`createStore<T>(options)`**: Context-based scoped store with provider, selector, and dispatch.
- **`createSimpleStore<T>(initialState)`**: Global singleton store, no Provider needed.
- **`useServerAction<TState, TInput>(action, initialState)`**: Wraps React 19's `useActionState` for server actions.

### Barrel Export (`src/index.ts`)

Single entry point re-exports everything from `./router` and `./hooks`.

### CLI Tool (`src/cli/`)

Interactive project scaffolding tool invoked via `npx chen` or `npx chen-the-dawnstreak`. Supports four project types: Web, Web+PWA, Desktop (Electron), Desktop (Tauri).

**Structure:**
- `index.ts` — Entry point with shebang (`#!/usr/bin/env node`), parses `process.argv` for project name, calls prompts and scaffold
- `prompts.ts` — `text()` and `select()` functions built on Node.js built-in `readline` (zero external dependencies)
- `scaffold.ts` — Orchestrator that assembles file lists per project type and writes them to disk via `fs.mkdirSync`/`writeFileSync`
- `templates/base.ts` — Common template generators: `indexHtml()`, `mainTsx()`, `appTsx()`, `appCss()`, `tsconfigJson()`, `gitignore()`, etc.
- `templates/package-json.ts` — `packageJson(name, type)` generates package.json with deps/scripts per project type
- `templates/vite-config.ts` — `viteConfig(type)` generates vite.config.ts importing the chen Vite plugin
- `templates/pwa.ts` — `manifest()` and `registerSw()` for PWA projects
- `templates/electron.ts` — `electronMain()` and `electronPreload()` for Electron projects
- `templates/tauri.ts` — `cargoToml()`, `tauriConf()`, `tauriMainRs()`, `tauriBuildRs()` for Tauri projects

**Key detail**: All templates are TypeScript functions returning string content (no physical template files). This works cleanly with `tsc`-only builds.

### Vite Plugin (`src/vite-plugin/index.ts`)

Exported as `chen-the-dawnstreak/vite-plugin`. The `chen(options?)` function returns an array of Vite plugins:

- **chen:core** — Configures `optimizeDeps.include` for chen-the-dawnstreak
- **chen:routes** (when `options.routes` is set) — File-based routing from `src/pages/`, generates virtual module `virtual:chen-routes` with `ChenRoutes` component. Supports dynamic routes `[id]`, catch-all `[...rest]`, layouts `_layout.tsx`, and 404 `_404.tsx`.
- **chen:pwa** (when `options.pwa` is set) — Injects manifest link and theme-color meta in HTML, registers Service Worker in production builds, writes `manifest.json` and `sw.js` to the build output via `closeBundle`
- **chen:ssr** (when `options.ssr` is set) — Stubs CSS imports during SSR builds, configures `ssr.noExternal`

Vite is an **optional** peer dependency — only needed when using the plugin.

### SSR (`src/ssr/index.ts`)

- `renderToStream(element, writable, options)` — Streaming SSR with React's `renderToPipeableStream`
- `renderToHTML(element, options)` — String-based SSR
- `createHTMLShell(options)` — Returns `{ beforeContent, afterContent }` for custom streaming
- `ChenSSRRouter` — Re-export of `StaticRouter` from react-router
- `isBrowser` / `isServer` — Environment detection

## Adding a New CLI Project Type

1. Create a template file in `src/cli/templates/` with functions returning file contents as strings
2. Add the type to `ProjectType` union in `src/cli/templates/package-json.ts`
3. Add a case in `packageJson()` for the new type's dependencies and scripts
4. Add a case in `viteConfig()` if special Vite config is needed
5. Add the file generation logic in `src/cli/scaffold.ts`
6. Add the option in `src/cli/index.ts` select prompt

## Package Entry Points

| Path | Description |
|------|-------------|
| `chen-the-dawnstreak` | Main library: router, hooks |
| `chen-the-dawnstreak/vite-plugin` | Vite plugin with file routing, PWA, SSR |
| `chen-the-dawnstreak/ssr` | SSR utilities |
| `chen` (bin) | CLI scaffolding tool |
