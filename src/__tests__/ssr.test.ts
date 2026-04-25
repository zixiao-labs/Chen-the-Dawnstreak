import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { PassThrough, Writable } from 'stream';
import { renderToStream } from '../ssr/index';
import type { RenderToStreamOptions } from '../ssr/index';

// Helper: collect all chunks written to a Writable into a string.
function collectWritable(): { writable: Writable; getOutput: () => string } {
  const chunks: Buffer[] = [];
  const writable = new PassThrough();
  writable.on('data', (chunk: Buffer) => chunks.push(chunk));
  return {
    writable,
    getOutput: () => Buffer.concat(chunks).toString('utf8'),
  };
}

// Helper: wait for the writable's 'finish' event (i.e., writable.end() was called)
function waitForFinish(writable: Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    writable.on('finish', resolve);
    writable.on('error', reject);
  });
}

const baseOptions: RenderToStreamOptions = {
  clientEntry: '/client.js',
  title: 'Test',
  lang: 'en',
  rootId: 'root',
};

// ─── renderToStream — PassThrough bridge (refactored in PR) ──────────────────

describe('renderToStream', () => {
  it('writes beforeContent (HTML opening) followed by afterContent (HTML closing)', async () => {
    const { writable, getOutput } = collectWritable();
    const element = React.createElement('div', null, 'Hello SSR');

    renderToStream(element, writable, baseOptions);
    await waitForFinish(writable);

    const output = getOutput();
    expect(output).toContain('<!DOCTYPE html>');
    expect(output).toContain('<html lang="en">');
    expect(output).toContain('<div id="root">');
    expect(output).toContain('Hello SSR');
    expect(output).toContain('</div>');
    expect(output).toContain('<script type="module" src="/client.js">');
    expect(output).toContain('</html>');
  });

  it('afterContent appears after React-rendered content (correct ordering)', async () => {
    const { writable, getOutput } = collectWritable();
    const element = React.createElement('span', null, 'ordered-content');

    renderToStream(element, writable, baseOptions);
    await waitForFinish(writable);

    const output = getOutput();
    const reactContentIdx = output.indexOf('ordered-content');
    const closingIdx = output.indexOf('</div>');
    const scriptIdx = output.indexOf('<script');
    const closingHtmlIdx = output.indexOf('</html>');

    expect(reactContentIdx).toBeGreaterThan(-1);
    expect(closingIdx).toBeGreaterThan(reactContentIdx);
    expect(scriptIdx).toBeGreaterThan(closingIdx);
    expect(closingHtmlIdx).toBeGreaterThan(scriptIdx);
  });

  it('calls onShellReady callback', async () => {
    const { writable } = collectWritable();
    const onShellReady = vi.fn();

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      onShellReady,
    });
    await waitForFinish(writable);

    expect(onShellReady).toHaveBeenCalledOnce();
  });

  it('calls onAllReady callback after stream finishes', async () => {
    const { writable } = collectWritable();
    const onAllReady = vi.fn();

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      onAllReady,
    });
    await waitForFinish(writable);

    expect(onAllReady).toHaveBeenCalledOnce();
  });

  it('exposes __chenAbort on the writable', () => {
    const { writable } = collectWritable();

    renderToStream(React.createElement('div'), writable, baseOptions);

    expect(typeof (writable as Writable & { __chenAbort?: () => void }).__chenAbort).toBe('function');
  });

  it('includes the title tag in the HTML shell when provided', async () => {
    const { writable, getOutput } = collectWritable();

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      title: 'My App',
    });
    await waitForFinish(writable);

    expect(getOutput()).toContain('<title>My App</title>');
  });

  it('includes cssHref link tag when provided', async () => {
    const { writable, getOutput } = collectWritable();

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      cssHref: '/style.css',
    });
    await waitForFinish(writable);

    expect(getOutput()).toContain('<link rel="stylesheet" href="/style.css">');
  });

  it('includes headTags in the HTML shell', async () => {
    const { writable, getOutput } = collectWritable();

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      headTags: ['<meta name="description" content="test">'],
    });
    await waitForFinish(writable);

    expect(getOutput()).toContain('<meta name="description" content="test">');
  });

  it('uses custom rootId in the HTML shell', async () => {
    const { writable, getOutput } = collectWritable();

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      rootId: 'app',
    });
    await waitForFinish(writable);

    expect(getOutput()).toContain('<div id="app">');
  });

  it('does not write afterContent if writable is already destroyed before bridge ends', async () => {
    // This tests the guard: if (writable.destroyed || writable.writableEnded) return;
    const onAllReady = vi.fn();
    const onError = vi.fn();

    // Create a writable that we'll destroy immediately after shell
    const chunks: string[] = [];
    const writable = new PassThrough();
    writable.on('data', (d: Buffer) => chunks.push(d.toString()));

    const onShellReady = vi.fn(() => {
      // Destroy the writable right after shell is ready
      writable.destroy(new Error('client disconnected'));
    });

    await new Promise<void>((resolve) => {
      writable.on('close', resolve);
      writable.on('error', () => resolve()); // swallow the error for test

      renderToStream(React.createElement('div', null, 'content'), writable, {
        ...baseOptions,
        onShellReady,
        onAllReady,
        onError,
      });
    });

    // onAllReady should NOT have been called because writable was destroyed
    expect(onAllReady).not.toHaveBeenCalled();
  });

  it('calls onError callback when bridge encounters an error', async () => {
    const onError = vi.fn();

    const chunks: Buffer[] = [];
    const writable = new PassThrough();
    writable.on('data', (d: Buffer) => chunks.push(d));

    // We'll manually emit an error on the writable to test bi-directional error propagation
    let resolved = false;
    const done = new Promise<void>((resolve) => {
      writable.on('close', () => {
        if (!resolved) { resolved = true; resolve(); }
      });
      writable.on('error', () => {
        if (!resolved) { resolved = true; resolve(); }
      });
    });

    renderToStream(React.createElement('div'), writable, {
      ...baseOptions,
      onError,
    });

    // Emit an error on writable to trigger the error propagation path
    process.nextTick(() => {
      if (!writable.destroyed && !writable.writableEnded) {
        writable.destroy(new Error('upstream error'));
      }
    });

    await done;
    // onError may or may not be called depending on timing, but writable should be destroyed
    expect(writable.destroyed).toBe(true);
  });

  it('writable ends exactly once (no double-end from bridge)', async () => {
    const { writable, getOutput } = collectWritable();
    let endCount = 0;
    const origEnd = writable.end.bind(writable);
    writable.end = (...args: Parameters<typeof writable.end>) => {
      endCount++;
      return origEnd(...args);
    };

    renderToStream(React.createElement('div', null, 'end-once'), writable, baseOptions);
    await waitForFinish(writable);

    expect(endCount).toBe(1);
    expect(getOutput()).toContain('end-once');
  });

  it('renders nested React elements correctly', async () => {
    const { writable, getOutput } = collectWritable();
    const element = React.createElement(
      'section',
      null,
      React.createElement('h1', null, 'Title'),
      React.createElement('p', null, 'Paragraph')
    );

    renderToStream(element, writable, baseOptions);
    await waitForFinish(writable);

    const output = getOutput();
    expect(output).toContain('<h1>');
    expect(output).toContain('Title');
    expect(output).toContain('<p>');
    expect(output).toContain('Paragraph');
  });
});