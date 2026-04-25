"use client";

import {
  BrowserRouter,
  HashRouter,
  type BrowserRouterProps,
  type HashRouterProps,
} from 'react-router';
import { createElement, type ReactElement } from 'react';

export {
  BrowserRouter as ChenRouter,
  HashRouter as ChenHashRouter,
  Route,
  Routes,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  useMatch,
} from 'react-router';

export type ChenRouterMode = 'browser' | 'hash' | 'auto';

export interface ChenAdaptiveRouterProps extends BrowserRouterProps, HashRouterProps {
  /**
   * 'browser' —— HTML5 History API（默认，SPA/SSR）
   * 'hash'    —— location.hash（Electron file:// 下必须用这个，否则刷新/深链 404）
   * 'auto'    —— 运行时探测：file: 协议用 hash，其它用 browser
   */
  mode?: ChenRouterMode;
}

/**
 * 自适应 Router：根据 mode 或运行时环境选择 BrowserRouter / HashRouter。
 *
 * Electron 打包渲染进程通过 file:// 加载 index.html，BrowserRouter 在这种协议下
 * 刷新任何非根路径都会 404（没有服务端 SPA fallback）。使用 mode="hash" 或
 * mode="auto" 可以避免这个问题。
 */
export function ChenAdaptiveRouter(props: ChenAdaptiveRouterProps): ReactElement {
  const { mode = 'auto', ...rest } = props;
  const resolved =
    mode === 'browser'
      ? 'browser'
      : mode === 'hash'
        ? 'hash'
        : typeof window !== 'undefined' && window.location.protocol === 'file:'
          ? 'hash'
          : 'browser';
  return createElement(resolved === 'hash' ? HashRouter : BrowserRouter, rest);
}
