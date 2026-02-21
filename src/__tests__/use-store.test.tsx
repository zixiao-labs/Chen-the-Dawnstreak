import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  createStore,
  createSimpleStore,
  useGlobalStore,
  useGlobalStoreDispatch,
} from '../hooks/use-store';

// ─── createSimpleStore ───────────────────────────────────────────────────────

describe('createSimpleStore', () => {
  it('getState 返回初始状态', () => {
    const store = createSimpleStore({ count: 0, name: 'chen' });
    expect(store.getState()).toEqual({ count: 0, name: 'chen' });
  });

  it('setState (对象) 更新状态', () => {
    const store = createSimpleStore({ count: 0 });
    store.setState({ count: 5 });
    expect(store.getState().count).toBe(5);
  });

  it('setState (函数) 基于前一状态更新', () => {
    const store = createSimpleStore({ count: 10 });
    store.setState((prev) => ({ count: prev.count + 1 }));
    expect(store.getState().count).toBe(11);
  });

  it('subscribe：状态更新时通知监听器', () => {
    const store = createSimpleStore({ count: 0 });
    let notified = 0;
    store.subscribe(() => { notified++; });
    store.setState({ count: 1 });
    expect(notified).toBe(1);
  });

  it('subscribe：取消订阅后不再通知', () => {
    const store = createSimpleStore({ count: 0 });
    let notified = 0;
    const unsubscribe = store.subscribe(() => { notified++; });
    unsubscribe();
    store.setState({ count: 1 });
    expect(notified).toBe(0);
  });

  it('useStore hook 返回当前状态', () => {
    const store = createSimpleStore({ value: 42 });
    const { result } = renderHook(() => store.useStore());
    expect(result.current.value).toBe(42);
  });

  it('useStore hook 在状态更新后重新渲染', async () => {
    const store = createSimpleStore({ value: 0 });
    const { result } = renderHook(() => store.useStore());

    act(() => store.setState({ value: 99 }));
    expect(result.current.value).toBe(99);
  });

  it('useDispatch hook 更新状态', async () => {
    const store = createSimpleStore({ count: 0 });
    const { result: storeResult } = renderHook(() => store.useStore());
    const { result: dispatchResult } = renderHook(() => store.useDispatch());

    act(() => dispatchResult.current({ count: 7 }));
    expect(storeResult.current.count).toBe(7);
  });
});

// ─── useGlobalStore / useGlobalStoreDispatch ─────────────────────────────────

describe('useGlobalStore & useGlobalStoreDispatch', () => {
  it('useGlobalStore 返回 store 状态', () => {
    const store = createSimpleStore({ x: 1 });
    const { result } = renderHook(() => useGlobalStore(store));
    expect(result.current.x).toBe(1);
  });

  it('useGlobalStoreDispatch 更新后，useGlobalStore 重新渲染', () => {
    const store = createSimpleStore({ x: 0 });
    const { result: stateResult } = renderHook(() => useGlobalStore(store));
    const { result: dispatchResult } = renderHook(() =>
      useGlobalStoreDispatch(store)
    );

    act(() => dispatchResult.current({ x: 55 }));
    expect(stateResult.current.x).toBe(55);
  });
});

// ─── createStore (Context-based) ─────────────────────────────────────────────

interface CounterState {
  count: number;
  label: string;
}

describe('createStore', () => {
  const counterStore = createStore<CounterState>({
    name: 'counter',
    initialState: { count: 0, label: 'zero' },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(counterStore.StoreProvider, null, children);

  it('useStore 返回初始状态', () => {
    const { result } = renderHook(() => counterStore.useStore(), { wrapper });
    expect(result.current).toEqual({ count: 0, label: 'zero' });
  });

  it('useStoreDispatch 更新状态', () => {
    const { result } = renderHook(
      () => ({
        state: counterStore.useStore(),
        dispatch: counterStore.useStoreDispatch(),
      }),
      { wrapper }
    );

    act(() => result.current.dispatch({ count: 5 }));
    expect(result.current.state.count).toBe(5);
  });

  it('useStoreDispatch 函数形式（基于前值）', () => {
    const { result } = renderHook(
      () => ({
        state: counterStore.useStore(),
        dispatch: counterStore.useStoreDispatch(),
      }),
      { wrapper }
    );

    act(() => result.current.dispatch({ count: 10 }));
    act(() => result.current.dispatch((prev) => ({ count: prev.count + 1 })));
    expect(result.current.state.count).toBe(11);
  });

  it('useStoreSelector 只取指定字段', () => {
    const { result } = renderHook(
      () => counterStore.useStoreSelector((s) => s.label),
      { wrapper }
    );
    expect(result.current).toBe('zero');
  });

  it('useStoreSelector 在相关字段更新时重新渲染', () => {
    const { result } = renderHook(
      () => ({
        count: counterStore.useStoreSelector((s) => s.count),
        dispatch: counterStore.useStoreDispatch(),
      }),
      { wrapper }
    );

    act(() => result.current.dispatch({ count: 42 }));
    expect(result.current.count).toBe(42);
  });

  it('StoreProvider 的 initialState 覆盖默认值', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        counterStore.StoreProvider,
        { initialState: { count: 100 }, children }
      );

    const { result } = renderHook(() => counterStore.useStore(), {
      wrapper: customWrapper,
    });
    expect(result.current.count).toBe(100);
  });

  it('在 Provider 外使用 useStore 应抛出错误', () => {
    expect(() => {
      renderHook(() => counterStore.useStore());
    }).toThrow();
  });

  it('在 Provider 外使用 useStoreDispatch 应抛出错误', () => {
    expect(() => {
      renderHook(() => counterStore.useStoreDispatch());
    }).toThrow();
  });
});
