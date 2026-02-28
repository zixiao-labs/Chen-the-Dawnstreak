import type { Plugin, HtmlTagDescriptor, ResolvedConfig, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';

export interface ChenPWAOptions {
  /** App name for manifest */
  name?: string;
  /** Short name */
  shortName?: string;
  /** Theme color (default: #6750a4) */
  themeColor?: string;
  /** Background color (default: #ffffff) */
  backgroundColor?: string;
  /** Display mode (default: standalone) */
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  /** Icon definitions */
  icons?: Array<{ src: string; sizes: string; type?: string }>;
}

export interface ChenRoutesOptions {
  /** Pages directory relative to project root (default: 'src/pages') */
  dir?: string;
}

export interface ChenPluginOptions {
  /** Enable PWA support. Pass true for defaults, or an object for custom config. */
  pwa?: boolean | ChenPWAOptions;
  /** Enable file-based routing from src/pages/. Pass true for defaults. */
  routes?: boolean | ChenRoutesOptions;
  /** Enable SSR support. Stubs CSS imports and configures ssr.noExternal. */
  ssr?: boolean;
}

// ─── File-based routing ───────────────────────────────────────────────────────

const VIRTUAL_MODULE_ID = 'virtual:chen-routes';
const RESOLVED_ID = '\0virtual:chen-routes';

interface PageFile {
  absPath: string;
  /** Path relative to pagesDir, e.g. 'blog/[id].tsx' */
  relPath: string;
}

interface RouteTreeNode {
  layout?: string;   // abs path to _layout file
  notFound?: string; // abs path to _404 file
  pages: Array<{ absPath: string; routeSegment: string }>;
  children: Map<string, RouteTreeNode>;
}

function scanPages(dir: string): PageFile[] {
  const results: PageFile[] = [];
  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(absPath);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const relPath = path.relative(dir, absPath).replace(/\\/g, '/');
        results.push({ absPath, relPath });
      }
    }
  }
  walk(dir);
  return results;
}

function convertToRoutePath(segment: string): string {
  return segment
    .replace(/\[\.\.\.([^\]]+)\]/, '*')
    .replace(/\[([^\]]+)\]/, ':$1');
}

function buildRouteTree(pages: PageFile[]): RouteTreeNode {
  const root: RouteTreeNode = { pages: [], children: new Map() };

  for (const page of pages) {
    const parts = page.relPath.split('/');
    const fileName = parts[parts.length - 1];
    const dirParts = parts.slice(0, -1);

    let node = root;
    for (const part of dirParts) {
      if (!node.children.has(part)) {
        node.children.set(part, { pages: [], children: new Map() });
      }
      node = node.children.get(part)!;
    }

    const baseName = fileName.replace(/\.(tsx?|jsx?)$/, '');

    if (baseName === '_layout') {
      node.layout = page.absPath;
    } else if (baseName === '_404') {
      node.notFound = page.absPath;
    } else if (!baseName.startsWith('_')) {
      const routeSegment = baseName === 'index' ? '' : convertToRoutePath(baseName);
      node.pages.push({ absPath: page.absPath, routeSegment });
    }
  }

  return root;
}

function generateImports(
  pages: PageFile[],
  viteRoot: string,
): { imports: string[]; varMap: Map<string, string> } {
  const imports: string[] = [];
  const varMap = new Map<string, string>();

  pages.forEach((page, i) => {
    const nameBase = page.relPath
      .replace(/\.(tsx?|jsx?)$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const varName = `_p${i}_${nameBase || 'page'}`;
    varMap.set(page.absPath, varName);
    const vitePath = '/' + path.relative(viteRoot, page.absPath).replace(/\\/g, '/');
    imports.push(`const ${varName} = lazy(() => import(${JSON.stringify(vitePath)}));`);
  });

  return { imports, varMap };
}

function buildRouteElement(
  node: RouteTreeNode,
  varMap: Map<string, string>,
  pathSegment?: string,
): string {
  const childElements: string[] = [];

  // Index routes first, then sorted by path
  const sortedPages = [...node.pages].sort((a, b) => {
    if (a.routeSegment === '') return -1;
    if (b.routeSegment === '') return 1;
    return a.routeSegment.localeCompare(b.routeSegment);
  });

  for (const page of sortedPages) {
    const v = varMap.get(page.absPath)!;
    if (page.routeSegment === '') {
      childElements.push(`createElement(Route,{index:true,element:createElement(${v})})`);
    } else {
      childElements.push(
        `createElement(Route,{path:${JSON.stringify(page.routeSegment)},element:createElement(${v})})`,
      );
    }
  }

  for (const [dirName, childNode] of node.children) {
    const dirSegment = convertToRoutePath(dirName);
    childElements.push(buildRouteElement(childNode, varMap, dirSegment));
  }

  if (pathSegment !== undefined) {
    const props: string[] = [`path:${JSON.stringify(pathSegment)}`];
    if (node.layout) {
      props.push(`element:createElement(${varMap.get(node.layout)!})`);
    }
    if (childElements.length === 0) {
      return `createElement(Route,{${props.join(',')}})`;
    }
    return `createElement(Route,{${props.join(',')}},${childElements.join(',')})`;
  }

  return childElements.join(',');
}

function emptyRoutesModule(): string {
  return `import {createElement} from 'react';
import {Routes} from 'react-router';
export function ChenRoutes(){return createElement(Routes,null);}
`;
}

function generateRoutesModule(pagesDir: string, viteRoot: string): string {
  if (!fs.existsSync(pagesDir)) return emptyRoutesModule();

  const allPages = scanPages(pagesDir);
  if (allPages.length === 0) return emptyRoutesModule();

  const routeTree = buildRouteTree(allPages);
  const { imports, varMap } = generateImports(allPages, viteRoot);

  let rootContent = buildRouteElement(routeTree, varMap);

  // Wrap everything in root layout if _layout.tsx exists
  if (routeTree.layout) {
    const lv = varMap.get(routeTree.layout)!;
    rootContent = `createElement(Route,{element:createElement(${lv})},${rootContent})`;
  }

  // _404.tsx renders outside the layout as a catch-all
  if (routeTree.notFound) {
    const nv = varMap.get(routeTree.notFound)!;
    rootContent += `,createElement(Route,{path:'*',element:createElement(${nv})})`;
  }

  return `import {createElement,lazy,Suspense} from 'react';
import {Routes,Route} from 'react-router';

${imports.join('\n')}

export function ChenRoutes(){
  return createElement(Suspense,{fallback:null},
    createElement(Routes,null,${rootContent})
  );
}
`;
}

function chenRoutes(options?: ChenRoutesOptions): Plugin {
  let pagesDir: string;
  let viteRoot: string;
  let server: ViteDevServer | undefined;

  function invalidateRoutes() {
    if (!server) return;
    const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
    if (mod) server.moduleGraph.invalidateModule(mod);
    server.ws.send({ type: 'full-reload' });
  }

  return {
    name: 'chen:routes',

    configResolved(config) {
      viteRoot = config.root;
      pagesDir = path.resolve(config.root, options?.dir ?? 'src/pages');
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id === RESOLVED_ID) {
        return generateRoutesModule(pagesDir, viteRoot);
      }
    },

    configureServer(devServer) {
      server = devServer;
      devServer.watcher.add(pagesDir);
      devServer.watcher.on('add', (file) => {
        if (file.startsWith(pagesDir)) invalidateRoutes();
      });
      devServer.watcher.on('unlink', (file) => {
        if (file.startsWith(pagesDir)) invalidateRoutes();
      });
    },

    handleHotUpdate({ file }) {
      if (file.startsWith(pagesDir)) invalidateRoutes();
    },
  };
}

// ─── Core plugin ──────────────────────────────────────────────────────────────

function chenCore(): Plugin {
  return {
    name: 'chen:core',

    config() {
      return {
        optimizeDeps: {
          include: ['mdui', 'chen-the-dawnstreak'],
        },
      };
    },

    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        {
          tag: 'style',
          children: `@import 'mdui/mdui.css';`,
          injectTo: 'head',
        },
      ];
      return tags;
    },
  };
}

// ─── PWA plugin ───────────────────────────────────────────────────────────────

function chenPWA(options: ChenPWAOptions): Plugin {
  const manifestData = {
    name: options.name || 'Chen App',
    short_name: options.shortName || options.name || 'Chen App',
    start_url: '/',
    display: options.display || 'standalone',
    background_color: options.backgroundColor || '#ffffff',
    theme_color: options.themeColor || '#6750a4',
    icons: options.icons || [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  let resolvedConfig: ResolvedConfig;

  const swSource = `const CACHE_NAME = 'chen-pwa-v1';
const URLS_TO_CACHE = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});`;

  return {
    name: 'chen:pwa',

    configResolved(config) {
      resolvedConfig = config;
    },

    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: '/manifest.json' },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: manifestData.theme_color },
          injectTo: 'head',
        },
      ];

      // Only register service worker in production
      if (resolvedConfig.command === 'build') {
        tags.push({
          tag: 'script',
          children: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `,
          injectTo: 'body',
        });
      }

      return tags;
    },

    closeBundle() {
      if (resolvedConfig.command !== 'build') return;

      const outDir = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir);

      fs.writeFileSync(
        path.join(outDir, 'manifest.json'),
        JSON.stringify(manifestData, null, 2),
        'utf-8',
      );

      fs.writeFileSync(
        path.join(outDir, 'sw.js'),
        swSource,
        'utf-8',
      );
    },
  };
}

// ─── SSR plugin ───────────────────────────────────────────────────────────────

function chenSSR(): Plugin {
  return {
    name: 'chen:ssr',

    config(_, { isSsrBuild }) {
      if (!isSsrBuild) return;
      return {
        ssr: {
          noExternal: ['chen-the-dawnstreak'],
        },
      };
    },

    resolveId(id, _importer, options) {
      if (!options?.ssr) return;
      if (id === 'mdui/mdui.css' || /\.css$/.test(id)) {
        return `\0chen-ssr-stub:${id}`;
      }
    },

    load(id) {
      if (id.startsWith('\0chen-ssr-stub:')) {
        return 'export default ""';
      }
    },
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Chen Vite plugin - MDUI integration with optional PWA and file-based routing support.
 *
 * @example
 * ```ts
 * import { chen } from 'chen-the-dawnstreak/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [react(), chen()],
 * });
 * ```
 *
 * @example File-based routing (src/pages/)
 * ```ts
 * chen({ routes: true })
 * ```
 *
 * @example PWA support
 * ```ts
 * chen({ pwa: { name: 'My App', themeColor: '#6750a4' } })
 * ```
 */
export function chen(options?: ChenPluginOptions): Plugin[] {
  const plugins: Plugin[] = [chenCore()];

  if (options?.pwa) {
    const pwaOptions: ChenPWAOptions =
      typeof options.pwa === 'boolean' ? {} : options.pwa;
    plugins.push(chenPWA(pwaOptions));
  }

  if (options?.routes) {
    const routesOptions: ChenRoutesOptions =
      typeof options.routes === 'boolean' ? {} : options.routes;
    plugins.push(chenRoutes(routesOptions));
  }

  if (options?.ssr) {
    plugins.push(chenSSR());
  }

  return plugins;
}

export default chen;
