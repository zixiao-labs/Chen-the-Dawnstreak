# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chen-the-Dawnstreak (赤刃明霄陈) is a React 19+ library that provides typed React wrappers for all 46 MDUI (Material Design UI) web components, plus a router wrapper, data-fetching hooks, a CLI scaffolding tool, and a Vite plugin. Published as `chen-the-dawnstreak` on npm.

## Build & Development

- **TypeScript compile**: `npm run build` (runs `tsc` + `chmod +x dist/cli/index.js`)
- **No test framework** is configured yet (`npm test` is a stub)
- **No bundler/linter** is configured — the project outputs ES modules via `tsc`
- Target: ES2020, Module: ESNext, JSX: react-jsx (automatic runtime), strict mode enabled
- Lib: ES2020 + DOM

## Architecture

### Component Factory (`src/components/create-component.tsx`)

The central pattern. `createComponent<P>(tagName, eventMap?)` produces a `forwardRef` React component that:

1. Renders the MDUI custom element via `createElement(tagName, ...)`
2. Separates event handler props from attribute props using the `eventMap`
3. Attaches/detaches DOM event listeners via `useEffect` on an internal ref
4. Translates `className` → `class` for the underlying web component
5. Merges forwarded refs with the internal ref using a `mergeRefs` utility

All 46 components follow this exact pattern. Each component is defined in `src/components/index.ts` as:
- A `Props` interface with typed MDUI attributes + event handlers
- A `createComponent<Props>('mdui-tag-name', { onReactEvent: 'dom-event' })` call
- A side-effect import (`import 'mdui/components/xxx.js'`) to register the custom element

**Key detail**: Event handlers (e.g., `onFocus`, `onChange`) are NOT passed as props to the DOM element. They are intercepted and attached via `addEventListener` on the ref. This is because React's synthetic event system doesn't work with web component custom events.

### Router (`src/router/index.ts`)

A thin re-export layer over `react-router` v7. `ChenRouter` is simply `BrowserRouter` renamed, with the side effect of importing `mdui/mdui.css`. All standard react-router exports (Route, Routes, Link, NavLink, useNavigate, useParams, etc.) are re-exported.

### Data Hooks (`src/hooks/`)

- **`useFetch<T>(url, options?)`**: GET hook with AbortController cleanup, `enabled` flag for conditional fetching, and `refetch` via a counter key. Returns `{ data, loading, error, refetch }`.
- **`useMutation<TData, TVariables>(url, options?)`**: POST hook (method configurable). Auto-serializes body as JSON. Returns `{ mutate, data, loading, error, reset }`.

### Barrel Export (`src/index.ts`)

Single entry point re-exports everything from `./components`, `./router`, and `./hooks`.

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

- **chen:core** — Injects `mdui/mdui.css` via `transformIndexHtml`, configures `optimizeDeps.include` for mdui and chen-the-dawnstreak
- **chen:pwa** (when `options.pwa` is set) — Injects manifest link and theme-color meta in HTML, registers Service Worker in production builds, writes `manifest.json` and `sw.js` to the build output via `closeBundle`

Vite is an **optional** peer dependency — only needed when using the plugin.

## Adding a New Component

1. Add the side-effect import for the MDUI custom element registration
2. Define a `Props` interface with the component's attributes and event handlers (typed as `EventHandler = (event: Event) => void`)
3. Call `createComponent<Props>('mdui-tag-name', eventMap)` where `eventMap` maps React-style prop names to DOM event names
4. All definitions go in `src/components/index.ts` following the numbered section pattern

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
| `chen-the-dawnstreak` | Main library: components, router, hooks |
| `chen-the-dawnstreak/vite-plugin` | Vite plugin with PWA support |
| `chen` (bin) | CLI scaffolding tool |

## MDUI MCP Server

This workspace has an MDUI MCP server configured (see `.claude/settings.local.json`) that provides access to MDUI component metadata, documentation, CSS classes, CSS variables, and icon codes. Use these tools when you need to look up MDUI component APIs or available properties.
