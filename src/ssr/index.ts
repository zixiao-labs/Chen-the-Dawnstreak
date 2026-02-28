import type { ReactElement } from 'react';
import { renderToString as reactRenderToString } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import type { Writable } from 'stream';

export { StaticRouter as ChenSSRRouter } from 'react-router';

// ─── Environment detection ──────────────────────────────────────────────────

export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChenSSROptions {
  title?: string;
  lang?: string;
  headTags?: string[];
  mduiCSSHref?: string;
  rootId?: string;
  clientEntry: string;
}

export interface HTMLShell {
  beforeContent: string;
  afterContent: string;
}

export interface RenderToStreamOptions extends ChenSSROptions {
  onShellReady?: () => void;
  onShellError?: (error: unknown) => void;
  onAllReady?: () => void;
  onError?: (error: unknown) => void;
}

// ─── HTML Shell ─────────────────────────────────────────────────────────────

export function createHTMLShell(options: ChenSSROptions): HTMLShell {
  const {
    title = '',
    lang = 'en',
    headTags = [],
    mduiCSSHref,
    rootId = 'root',
    clientEntry,
  } = options;

  const cssTag = mduiCSSHref
    ? `<link rel="stylesheet" href="${mduiCSSHref}">`
    : '';

  const beforeContent = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${title ? `<title>${title}</title>` : ''}
  ${cssTag}
  ${headTags.join('\n  ')}
</head>
<body>
  <div id="${rootId}">`;

  const afterContent = `</div>
  <script type="module" src="${clientEntry}"></script>
</body>
</html>`;

  return { beforeContent, afterContent };
}

// ─── renderToStream ─────────────────────────────────────────────────────────

export function renderToStream(
  element: ReactElement,
  writable: Writable,
  options: RenderToStreamOptions,
): void {
  const shell = createHTMLShell(options);

  const { pipe } = renderToPipeableStream(element, {
    onShellReady() {
      writable.write(shell.beforeContent);
      pipe(writable);
      options.onShellReady?.();
    },
    onShellError(error) {
      options.onShellError?.(error);
    },
    onAllReady() {
      writable.write(shell.afterContent);
      writable.end();
      options.onAllReady?.();
    },
    onError(error) {
      options.onError?.(error);
    },
  });
}

// ─── renderToString ─────────────────────────────────────────────────────────

export function renderToHTML(
  element: ReactElement,
  options: ChenSSROptions,
): string {
  const shell = createHTMLShell(options);
  const content = reactRenderToString(element);
  return shell.beforeContent + content + shell.afterContent;
}

// ─── getMduiCSS ─────────────────────────────────────────────────────────────

export function getMduiCSS(): string {
  const { createRequire } = require('module') as typeof import('module');
  const req = createRequire(import.meta.url);
  const cssPath = req.resolve('mdui/mdui.css');
  const fs = require('fs') as typeof import('fs');
  return fs.readFileSync(cssPath, 'utf-8');
}
