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

## Vite Plugin

配套 Vite 插件，自动注入 MDUI CSS 并支持 PWA。

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chen } from 'chen-the-dawnstreak/vite-plugin';

export default defineConfig({
  plugins: [react(), chen()],
});
```

### 文件路由

在 `src/pages/` 下按约定放置页面文件，插件自动生成路由，无需手写 `<Routes>/<Route>`。

```ts
chen({ routes: true })
// 或自定义目录
chen({ routes: { dir: 'src/pages' } })
```

在 `vite-env.d.ts` 中添加类型引用：

```ts
/// <reference types="chen-the-dawnstreak/vite-plugin/client" />
```

在应用入口使用：

```tsx
import { ChenRouter } from 'chen-the-dawnstreak';
import { ChenRoutes } from 'virtual:chen-routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChenRouter>
    <ChenRoutes />
  </ChenRouter>
);
```

**文件约定：**

| 文件 | 路由 | 说明 |
|------|------|------|
| `pages/index.tsx` | `/` | 首页 |
| `pages/about.tsx` | `/about` | 静态路由 |
| `pages/blog/index.tsx` | `/blog` | 目录 index |
| `pages/blog/[id].tsx` | `/blog/:id` | 动态参数 |
| `pages/[...slug].tsx` | `*` | 通配 catch-all |
| `pages/_layout.tsx` | — | 根布局，需含 `<Outlet />` |
| `pages/blog/_layout.tsx` | — | `/blog` 嵌套布局 |
| `pages/_404.tsx` | `*` | 自定义 404 页 |

`_layout.tsx` 示例：

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

页面文件自动进行代码分割（`React.lazy`），开发时新增/删除文件触发自动刷新。

### PWA 支持

```ts
chen({ pwa: true })
// 或自定义配置
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

启用 PWA 后，构建时自动生成 `manifest.json` 和 `sw.js`，并在 HTML 中注入 manifest link、theme-color meta 和 Service Worker 注册脚本。

## Roadmap

- [x] Typed React wrappers for all 46 MDUI components
- [x] Event handling via ref + addEventListener
- [x] Router (react-router v7 wrapper)
- [x] Data fetching hooks (useFetch, useMutation)
- [ ] SSR support
- [x] File-based routing
- [ ] Server actions(RSC)
- [x] Build tooling (Vite plugin)
- [x] CLI scaffolding tool (Web / PWA / Electron / Tauri)

## License

MIT
