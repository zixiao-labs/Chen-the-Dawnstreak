## Chen-the-Dawnstreak

[![npm version](https://badge.fury.io/js/chen-the-dawnstreak.svg)](https://www.npmjs.com/package/chen-the-dawnstreak) 
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

赤刃明霄陈 — 轻量级 React 元框架：文件路由 · 数据钩子 · SSR · PWA · 多平台脚手架。

Star过200就在README里放赤刃明霄陈立绘

## Quick Start — CLI

```bash
npx chen-the-dawnstreak my-app
# or
npx chen my-app
```

交互式选择项目类型：

| 类型 | 说明 |
|------|------|
| Web | Vite 或 Nasti + React |
| Web + PWA | 额外生成 manifest.json、Service Worker |
| Desktop (Electron) | Vite 或 **Nasti** + Electron 主进程/预加载脚本 |
| Desktop (Tauri) | Vite + src-tauri/ Rust 项目 |
| Mobile (React Native / Expo) | Expo + React Navigation + Chen hooks |

Web、PWA、Electron 项目可在 Vite（稳定）与 **Nasti**（Rolldown + OXC，更快）之间选择。

CLI **不会自动安装依赖**，创建完成后按提示手动执行 `npm install`。

## Installation

```bash
npm install chen-the-dawnstreak
```

Peer requirement: React 19+.

## Quick Start

```tsx
import { ChenRouter, Routes, Route, Link, useFetch } from 'chen-the-dawnstreak';

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

## Router

Thin wrapper around react-router v7.

```tsx
import { ChenRouter, Route, Routes, Link, useNavigate } from 'chen-the-dawnstreak';
```

Re-exports: `ChenRouter`, `Route`, `Routes`, `Link`, `NavLink`, `Navigate`, `Outlet`, `useNavigate`, `useParams`, `useSearchParams`, `useLocation`, `useMatch`.

## Data Fetching

### useFetch

```tsx
import { useFetch } from 'chen-the-dawnstreak';

function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map((u) => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

### useMutation

```tsx
import { useMutation } from 'chen-the-dawnstreak';

function CreateUser() {
  const { mutate, loading } = useMutation<User, { name: string }>('/api/users');

  return (
    <button disabled={loading} onClick={() => mutate({ name: 'Chen' })}>
      Create
    </button>
  );
}
```

## Forms

### useForm

Lightweight form management hook with validation, similar to React Hook Form.

```tsx
import { useForm } from 'chen-the-dawnstreak';

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
      <input {...register('email')} placeholder="Email" />
      {errors.email && <p>{errors.email}</p>}
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <p>{errors.password}</p>}
      <button type="submit" disabled={isSubmitting}>Login</button>
    </form>
  );
}
```

Returns: `{ values, errors, touched, isValid, isSubmitting, register, handleSubmit, setValue, setValues, reset, validate, validateField }`.

Validation rules: `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate` (async), `custom`.

### useController

For controlled components that don't use standard `onChange`:

```tsx
import { useForm, useController } from 'chen-the-dawnstreak';

function MyForm() {
  const form = useForm({ defaultValues: { role: 'user' } });
  const { field, fieldState } = useController(form, { name: 'role' });

  return <select value={field.value} onChange={field.onChange}>...</select>;
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
  return <button onClick={() => dispatch((s) => ({ count: s.count + 1 }))}>Count: {count}</button>;
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
  return <button onClick={() => dispatch({ dark: !dark })}>{dark ? 'Light' : 'Dark'}</button>;
}
```

## Server Actions / RSC

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
      <input name="name" placeholder="Name" />
      <button type="submit" disabled={isPending}>Create</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

Re-exports: `useFormStatus` (from `react-dom`), `useOptimistic` (from `react`).

## SSR

Chen supports server-side rendering with streaming and string-based APIs.

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
import { renderToStream, renderToHTML, createHTMLShell, ChenSSRRouter } from 'chen-the-dawnstreak/ssr';
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
    cssHref: '/assets/style.css',
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
- `isBrowser` / `isServer` — environment detection constants

## Vite Plugin

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

## React Native

Chen 通过 `chen-the-dawnstreak/native` 入口提供 React Native 支持，封装了 React Navigation 并导出与 Web 端一致的数据 Hook。

### 安装

```bash
npm install chen-the-dawnstreak @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### 导航

`ChenNativeRouter` 是 React Navigation `NavigationContainer` 的别名，API 完全一致。

```tsx
import { ChenNativeRouter, createNativeStackNavigator } from 'chen-the-dawnstreak/native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ChenNativeRouter>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </ChenNativeRouter>
  );
}
```

也可以使用底部标签导航：

```tsx
import { ChenNativeRouter, createBottomTabNavigator } from 'chen-the-dawnstreak/native';

const Tab = createBottomTabNavigator();
```

Re-exports: `ChenNativeRouter`, `createNativeStackNavigator`, `createBottomTabNavigator`, `useNavigation`, `useRoute`, `useFocusEffect`, `useIsFocused`.

### 数据 Hook（与 Web 端完全一致）

`useFetch`、`useMutation`、`createStore`、`createSimpleStore`、`useServerAction` 均可直接用于 React Native：

```tsx
import { useFetch } from 'chen-the-dawnstreak/native';

function PostList() {
  const { data, loading, error } = useFetch<Post[]>('https://api.example.com/posts');

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```

### useNativeForm

针对 React Native 的表单 Hook。与 `useForm` 逻辑完全相同，但 `registerNative()` 返回 `onChangeText` / `onBlur` / `value` 以直接绑定 `TextInput`：

```tsx
import { useNativeForm } from 'chen-the-dawnstreak/native';
import { View, TextInput, Text, Button } from 'react-native';

function LoginForm() {
  const { registerNative, submit, errors, isSubmitting } = useNativeForm({
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
    <View>
      <TextInput placeholder="Email" {...registerNative('email')} />
      {errors.email && <Text>{errors.email}</Text>}
      <TextInput placeholder="Password" secureTextEntry {...registerNative('password')} />
      {errors.password && <Text>{errors.password}</Text>}
      <Button title="Login" onPress={submit} disabled={isSubmitting} />
    </View>
  );
}
```

## Roadmap

- [x] Router (react-router v7 wrapper)
- [x] File-based routing
- [x] Data fetching hooks (useFetch, useMutation)
- [x] Form management (useForm, useController)
- [x] State management (createStore, createSimpleStore)
- [x] Server actions (RSC)
- [x] SSR support (streaming + string)
- [x] Build tooling (Vite plugin)
- [x] CLI scaffolding tool (Web / PWA / Electron / Tauri / React Native)
- [x] React Native support (navigation, hooks, useNativeForm)
- [x] Nasti Electron support

## License

MIT
