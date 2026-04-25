import type { ReactElement } from 'react';
import { renderToString as reactRenderToString } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough, type Writable } from 'stream';

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

  // React 的 PipeableStream.pipe(dest) 没有 { end: false } 选项，pipe 完成后
  // 会自动 writable.end()。若直接 pipe(writable)，onAllReady 里再 write+end
  // 会抛 ERR_STREAM_WRITE_AFTER_END，afterContent（</div></body></html>）丢失。
  //
  // 方案：插一层 PassThrough —— React 流入 PassThrough，PassThrough 'end'
  // 触发时再把 afterContent 写进用户的 writable 并结束。
  const bridge = new PassThrough();
  // 用 pipe({ end: false }) 保留 writable 的 backpressure 语义；end 由我们手动触发
  bridge.pipe(writable, { end: false });
  bridge.on('end', () => {
    // 检查 writable 是否已被销毁或结束
    if (writable.destroyed || writable.writableEnded) {
      return;
    }
    try {
      writable.write(shell.afterContent);
      writable.end();
      options.onAllReady?.();
    } catch (err) {
      options.onError?.(err);
      writable.destroy(err instanceof Error ? err : new Error(String(err)));
    }
  });
  bridge.on('error', (err: Error) => {
    options.onError?.(err);
    writable.destroy(err);
  });
  // 双向错误传播：writable 独立错误需要清理 bridge
  writable.on('error', (err: Error) => {
    options.onError?.(err);
    if (bridge.destroy) {
      bridge.destroy(err);
    }
  });

  const { pipe, abort } = renderToPipeableStream(element, {
    onShellReady() {
      writable.write(shell.beforeContent);
      pipe(bridge);
      options.onShellReady?.();
    },
    onShellError(error) {
      // Shell 渲染失败，尚未写过任何东西，交给调用方决定（通常返回 500）
      options.onShellError?.(error);
    },
    onError(error) {
      options.onError?.(error);
    },
  });

  // 暴露 abort 供调用方（如超时时）调用
  (writable as Writable & { __chenAbort?: () => void }).__chenAbort = abort;
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

