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
  cssHref?: string;
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
    cssHref,
    rootId = 'root',
    clientEntry,
  } = options;

  const cssTag = cssHref
    ? `<link rel="stylesheet" href="${cssHref}">`
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

