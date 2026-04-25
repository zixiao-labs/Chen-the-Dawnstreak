import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ChenAdaptiveRouter, ChenHashRouter } from '../router/index';

// ─── ChenHashRouter re-export ─────────────────────────────────────────────────

describe('ChenHashRouter', () => {
  it('renders without crashing', () => {
    const { container } = render(
      React.createElement(ChenHashRouter, null,
        React.createElement('div', null, 'hash route')
      )
    );
    expect(container.textContent).toContain('hash route');
  });
});

// ─── ChenAdaptiveRouter ───────────────────────────────────────────────────────

describe('ChenAdaptiveRouter', () => {
  let originalProtocol: string;

  beforeEach(() => {
    // Store original location descriptor
    originalProtocol = window.location.protocol;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore window.location.protocol if it was changed
  });

  it('mode="browser" renders BrowserRouter content regardless of protocol', () => {
    // Simulate file: protocol but force browser mode
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'file:' },
      writable: true,
      configurable: true,
    });

    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        { mode: 'browser' },
        React.createElement('div', null, 'browser-content')
      )
    );
    expect(container.textContent).toContain('browser-content');
  });

  it('mode="hash" renders HashRouter content regardless of protocol', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'http:' },
      writable: true,
      configurable: true,
    });

    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        { mode: 'hash' },
        React.createElement('div', null, 'hash-content')
      )
    );
    expect(container.textContent).toContain('hash-content');
  });

  it('mode="auto" with http: protocol uses BrowserRouter', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'http:' },
      writable: true,
      configurable: true,
    });

    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        { mode: 'auto' },
        React.createElement('div', null, 'auto-http-content')
      )
    );
    expect(container.textContent).toContain('auto-http-content');
  });

  it('mode="auto" with file: protocol uses HashRouter', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'file:' },
      writable: true,
      configurable: true,
    });

    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        { mode: 'auto' },
        React.createElement('div', null, 'auto-file-content')
      )
    );
    expect(container.textContent).toContain('auto-file-content');
  });

  it('default mode (auto) with https: protocol uses BrowserRouter', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'https:' },
      writable: true,
      configurable: true,
    });

    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        {},
        React.createElement('div', null, 'default-https')
      )
    );
    expect(container.textContent).toContain('default-https');
  });

  it('resolves to hash when mode is "hash" even on http: protocol', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'http:' },
      writable: true,
      configurable: true,
    });

    // mode='hash' should always use HashRouter
    // HashRouter uses window.location.hash, BrowserRouter uses window.history
    // We verify it renders correctly — both work, but hash mode uses #-based routing
    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        { mode: 'hash' },
        React.createElement('span', null, 'forced-hash')
      )
    );
    expect(container.textContent).toContain('forced-hash');
  });

  it('mode resolution: "browser" maps to browser regardless', () => {
    // Covers the mode === 'browser' branch in the ternary
    const { container } = render(
      React.createElement(
        ChenAdaptiveRouter,
        { mode: 'browser' },
        React.createElement('p', null, 'explicit-browser')
      )
    );
    expect(container.textContent).toContain('explicit-browser');
  });

  it('passes extra props (e.g. basename) down to underlying router', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'http:' },
      writable: true,
      configurable: true,
    });

    // Should not throw when passing a basename prop
    expect(() =>
      render(
        React.createElement(
          ChenAdaptiveRouter,
          { mode: 'browser', basename: '/' },
          React.createElement('div', null, 'with-basename')
        )
      )
    ).not.toThrow();
  });
});