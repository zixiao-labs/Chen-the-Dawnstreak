## Chen-the-Dawnstreak

[![npm version](https://badge.fury.io/js/chen-the-dawnstreak.svg)](https://www.npmjs.com/package/chen-the-dawnstreak) 
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

赤刃明霄陈 — 全栈 React 框架，不依赖 Vercel。

Star过200就在README里放赤刃明霄陈立绘

Typed React wrappers for all 46 [MDUI](https://www.mdui.org/) Web Components, plus routing and data-fetching hooks.

## Quick Start — CLI

```bash
npx chen-the-dawnstreak my-app
# or
npx chen my-app
```

交互式选择项目类型：

| 类型 | 说明 |
|------|------|
| Web | Vite + React + MDUI |
| Web + PWA | 额外生成 manifest.json、Service Worker |
| Desktop (Electron) | 额外生成 Electron 主进程/预加载脚本 |
| Desktop (Tauri) | 额外生成 src-tauri/ Rust 项目 |

CLI **不会自动安装依赖**，创建完成后按提示手动执行 `npm install`。

## Installation

```bash
npm install chen-the-dawnstreak
```

Peer requirement: React 19+.

## Quick Start

```tsx
import { ChenRouter, Button, TextField, useFetch } from 'chen-the-dawnstreak';

function App() {
  return (
    <ChenRouter>
      <Button variant="filled" onFocus={() => console.log('focused')}>
        Click me
      </Button>
    </ChenRouter>
  );
}
```

## Components

All 46 MDUI components are wrapped as typed React components with proper event handling.

```tsx
import { Button, TextField, Dialog, Switch, Tabs, Tab, TabPanel } from 'chen-the-dawnstreak';

// Button with events
<Button variant="tonal" onBlur={(e) => console.log(e)}>Submit</Button>

// Text field with change tracking
<TextField
  variant="outlined"
  label="Email"
  type="email"
  onInput={(e) => console.log(e)}
/>

// Dialog
<Dialog open={isOpen} headline="Confirm" onClose={() => setOpen(false)}>
  Are you sure?
</Dialog>

// Tabs
<Tabs value="tab1" onChange={(e) => console.log(e)}>
  <Tab value="tab1">First</Tab>
  <Tab value="tab2">Second</Tab>
  <TabPanel value="tab1">Content 1</TabPanel>
  <TabPanel value="tab2">Content 2</TabPanel>
</Tabs>
```

Full component list: Avatar, Badge, BottomAppBar, Button, ButtonIcon, Card, Checkbox, Chip, CircularProgress, Collapse, CollapseItem, Dialog, Divider, Dropdown, Fab, Icon, Layout, LayoutItem, LayoutMain, LinearProgress, List, ListItem, ListSubheader, Menu, MenuItem, NavigationBar, NavigationBarItem, NavigationDrawer, NavigationRail, NavigationRailItem, Radio, RadioGroup, RangeSlider, SegmentedButton, SegmentedButtonGroup, Select, Slider, Snackbar, Switch, Tab, TabPanel, Tabs, TextField, Tooltip, TopAppBar, TopAppBarTitle.

## Router

Thin wrapper around react-router v7. `ChenRouter` automatically injects MDUI's CSS.

```tsx
import { ChenRouter, Route, Routes, Link, useNavigate } from 'chen-the-dawnstreak';

function App() {
  return (
    <ChenRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </ChenRouter>
  );
}
```

Re-exports: `ChenRouter`, `Route`, `Routes`, `Link`, `NavLink`, `Navigate`, `Outlet`, `useNavigate`, `useParams`, `useSearchParams`, `useLocation`, `useMatch`.

## Data Fetching

### useFetch

```tsx
import { useFetch } from 'chen-the-dawnstreak';

function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <List>
      {data?.map((u) => <ListItem key={u.id} headline={u.name} />)}
      <Button onClick={refetch}>Refresh</Button>
    </List>
  );
}
```

### useMutation

```tsx
import { useMutation } from 'chen-the-dawnstreak';

function CreateUser() {
  const { mutate, loading } = useMutation<User, { name: string }>('/api/users');

  return (
    <Button loading={loading} onClick={() => mutate({ name: 'Chen' })}>
      Create
    </Button>
  );
}
```

## Forms

### useForm

Lightweight form management hook with validation, similar to React Hook Form.

```tsx
import { useForm, TextField, Button } from 'chen-the-dawnstreak';

function LoginForm() {
  const { register, handleSubmit, errors, isSubmitting } = useForm({
    defaultValues: { email: '', password: '' },
    validationRules: {
      email: { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } },
      password: { required: true, minLength: { value: 8, message: 'Min 8 characters' } },
    },
    onSubmit: async (values) => {
      await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) });
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextField label="Email" {...register('email')} />
      {errors.email && <p>{errors.email}</p>}
      <TextField label="Password" type="password" {...register('password')} />
      {errors.password && <p>{errors.password}</p>}
      <Button type="submit" loading={isSubmitting}>Login</Button>
    </form>
  );
}
```

Returns: `{ values, errors, touched, isValid, isSubmitting, register, handleSubmit, setValue, setValues, reset, validate, validateField }`.

Validation rules: `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate` (async), `custom`.

### useController

For controlled components that don't use standard `onChange`:

```tsx
import { useForm, useController, Select } from 'chen-the-dawnstreak';

function MyForm() {
  const form = useForm({ defaultValues: { role: 'user' } });
  const { field, fieldState } = useController(form, { name: 'role' });

  return <Select label="Role" value={field.value} onChange={field.onChange} />;
}
```

## State Management

### createStore (Context-based)

Creates a scoped store with React Context. Each `StoreProvider` holds its own state.

```tsx
import { createStore } from 'chen-the-dawnstreak';

const { StoreProvider, useStore, useStoreDispatch, useStoreSelector } = createStore({
  name: 'counter',
  initialState: { count: 0, label: 'Counter' },
});

function Counter() {
  const count = useStoreSelector((s) => s.count);
  const dispatch = useStoreDispatch();
  return <Button onClick={() => dispatch((s) => ({ count: s.count + 1 }))}>Count: {count}</Button>;
}

function App() {
  return (
    <StoreProvider>
      <Counter />
    </StoreProvider>
  );
}
```

### createSimpleStore (Global singleton)

Module-level store, no Provider needed. Good for app-wide state like themes or auth.

```tsx
import { createSimpleStore } from 'chen-the-dawnstreak';

const themeStore = createSimpleStore({ dark: false });

function ThemeToggle() {
  const { dark } = themeStore.useStore();
  const dispatch = themeStore.useDispatch();
  return <Switch checked={dark} onChange={() => dispatch({ dark: !dark })} />;
}
```

## Server Actions / RSC

All components have `"use client"` directives and work with React Server Components.

### useServerAction

Wraps React 19's `useActionState` for server actions:

```tsx
import { useServerAction } from 'chen-the-dawnstreak';

// Server action (in a "use server" file)
async function createUser(prev: { error?: string }, formData: FormData) {
  "use server";
  const name = formData.get('name') as string;
  // ... create user
  return { error: undefined };
}

// Client component
function CreateUserForm() {
  const { state, execute, isPending } = useServerAction(createUser, { error: undefined });

  return (
    <form action={execute}>
      <TextField name="name" label="Name" />
      <Button type="submit" loading={isPending}>Create</Button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

Re-exports: `useFormStatus` (from `react-dom`), `useOptimistic` (from `react`).

## SSR

Chen supports server-side rendering. MDUI custom elements output as plain HTML tags during SSR and upgrade on the client when the browser registers them.

### Setup

```ts
// vite.config.ts
import { chen } from 'chen-the-dawnstreak/vite-plugin';

export default defineConfig({
  plugins: [react(), chen({ ssr: true })],
});
```

The `ssr: true` option stubs CSS imports during SSR builds and configures `ssr.noExternal`.

### Server-side rendering

```tsx
import { renderToStream, renderToHTML, createHTMLShell, ChenSSRRouter, getMduiCSS } from 'chen-the-dawnstreak/ssr';
import express from 'express';

const app = express();
app.use(express.static('dist/client'));

app.get('*', (req, res) => {
  const element = (
    <ChenSSRRouter location={req.url}>
      <App />
    </ChenSSRRouter>
  );

  // Option 1: Streaming (recommended)
  renderToStream(element, res, {
    clientEntry: '/assets/main.js',
    title: 'My App',
    mduiCSSHref: '/assets/mdui.css',
  });

  // Option 2: String rendering
  // const html = renderToHTML(element, { clientEntry: '/assets/main.js', title: 'My App' });
  // res.send(html);
});
```

### API

- `renderToStream(element, writable, options)` — streams HTML with React's `renderToPipeableStream`
- `renderToHTML(element, options)` — returns complete HTML string
- `createHTMLShell(options)` — returns `{ beforeContent, afterContent }` for custom streaming
- `ChenSSRRouter` — re-export of `StaticRouter` from react-router
- `getMduiCSS()` — reads MDUI CSS from disk for inlining
- `isBrowser` / `isServer` — environment detection constants

### How it works

During SSR, `createElement('mdui-button', ...)` outputs `<mdui-button>` as a plain HTML tag. The custom element registration (`import 'mdui/components/button.js'`) is guarded behind `typeof window !== 'undefined'` and only runs in the browser. On hydration, the client bundle registers all MDUI custom elements and the browser upgrades them with shadow DOM and interactivity.

## Vite Plugin

Includes a Vite plugin, automatically injecting MDUI CSS and supporting PWA.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chen } from 'chen-the-dawnstreak/vite-plugin';

export default defineConfig({
  plugins: [react(), chen()],
});
```

### File Routing

Place page files under `src/pages/` according to convention. The plugin automatically generates routes, eliminating the need to manually write `<Routes>/<Route>`.

```ts
chen({ routes: true })
// Or custom directory
chen({ routes: { dir: 'src/pages' } })
```

Add type references in `vite-env.d.ts`:

```ts
/// <reference types="chen-the-dawnstreak/vite-plugin/client" />
```

Use in the application entry point:

```tsx
import { ChenRouter } from 'chen-the-dawnstreak';
import { ChenRoutes } from 'virtual:chen-routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChenRouter>
    <ChenRoutes />
  </ChenRouter>
);
```

**File Conventions:**

| File | Route | Description |
|------|------|------|
| `pages/index.tsx` | `/` | Homepage |
| `pages/about.tsx` | `/about` | Static Routing |
| `pages/blog/index.tsx` | `/blog` | Index |
| `pages/blog/[id].tsx` | `/blog/:id` | Dynamic Parameters |
| `pages/[...slug].tsx` | `*` | Wildcard catch-all |
| `pages/_layout.tsx` | — | Root Layout, must contain `<Outlet />` |
| `pages/blog/_layout.tsx` | — | `/blog` Nested Layout |
| `pages/_404.tsx` | `*` | Custom 404 Page |

`_layout.tsx` Example:

```tsx
import { Outlet } from 'chen-the-dawnstreak';

export default function Layout() {
  return (
    <>
      <nav>...</nav>
      <Outlet />
    </>
  );
}
```

Page files are automatically split using `React.lazy`. Adding/deleting files during development triggers an automatic refresh.

### PWA Support

```ts
chen({ pwa: true })
// Or custom configuration
chen({
  pwa: {
    name: 'My App',
    shortName: 'App',
    themeColor: '#6750a4',
    backgroundColor: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

After enabling PWA, `manifest.json` and `sw.js` are automatically generated during the build process, and the manifest link, theme-color meta, and Service Worker registration scripts are injected into the HTML.

## Roadmap

- [x] Typed React wrappers for all 46 MDUI components
- [x] Event handling via ref + addEventListener
- [x] Router (react-router v7 wrapper)
- [x] Data fetching hooks (useFetch, useMutation)
- [x] SSR support
- [x] File-based routing
- [x] Server actions(RSC)
- [x] Build tooling (Vite plugin)
- [x] CLI scaffolding tool (Web / PWA / Electron / Tauri)

## License

MIT
