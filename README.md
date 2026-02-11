## Chen-the-Dawnstreak

赤刃明霄陈 — 全栈 React 框架，不依赖 Vercel。

Typed React wrappers for all 46 [MDUI](https://www.mdui.org/) Web Components, plus routing and data-fetching hooks.

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

## Roadmap

- [x] Typed React wrappers for all 46 MDUI components
- [x] Event handling via ref + addEventListener
- [x] Router (react-router v7 wrapper)
- [x] Data fetching hooks (useFetch, useMutation)
- [ ] SSR support
- [ ] File-based routing
- [ ] Server actions
- [ ] Build tooling (Vite plugin)
- [ ] CLI scaffolding tool

## License

MIT
