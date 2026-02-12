import type { Plugin, HtmlTagDescriptor, ResolvedConfig } from 'vite';
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

export interface ChenPluginOptions {
  /** Enable PWA support. Pass true for defaults, or an object for custom config. */
  pwa?: boolean | ChenPWAOptions;
}

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

/**
 * Chen Vite plugin - MDUI integration with optional PWA support.
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

  return plugins;
}

export default chen;
