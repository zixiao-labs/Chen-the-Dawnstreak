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

  it('在 Provider 外使用 useStoreSelector 应抛出错误', () => {
    expect(() => {
      renderHook(() => counterStore.useStoreSelector((s) => s.count));
    }).toThrow();
  });

  it('useStoreSelector 自定义 equalityFn：浅比较对象时不触发多余渲染', () => {
    const objStore = createStore<{ nested: { x: number }; other: number }>({
      name: 'obj-store',
      initialState: { nested: { x: 1 }, other: 0 },
    });
    const objWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(objStore.StoreProvider, null, children);

    let renderCount = 0;
    const shallowEqual = (a: { x: number }, b: { x: number }) => a.x === b.x;

    const { result } = renderHook(
      () => {
        renderCount++;
        return {
          nested: objStore.useStoreSelector((s) => s.nested, shallowEqual),
          dispatch: objStore.useStoreDispatch(),
        };
      },
      { wrapper: objWrapper }
    );

    const initialRenders = renderCount;
    // Update only 'other'，nested.x 保持不变；新建一个 nested 引用以验证 equalityFn 生效
    act(() => result.current.dispatch({ nested: { x: 1 }, other: 99 }));

    // selector 返回 nested 对象；equalityFn 认为 x 相同 → 不应触发额外渲染
    expect(result.current.nested.x).toBe(1);
    expect(renderCount).toBe(initialRenders);
  });

  it('useStoreSelector 默认 Object.is 比较：引用不同时触发重新渲染', () => {
    const objStore2 = createStore<{ items: number[] }>({
      name: 'items-store',
      initialState: { items: [1, 2, 3] },
    });
    const objWrapper2 = ({ children }: { children: React.ReactNode }) =>
      React.createElement(objStore2.StoreProvider, null, children);

    const { result } = renderHook(
      () => ({
        items: objStore2.useStoreSelector((s) => s.items),
        dispatch: objStore2.useStoreDispatch(),
      }),
      { wrapper: objWrapper2 }
    );

    const newItems = [4, 5, 6];
    act(() => result.current.dispatch({ items: newItems }));
    expect(result.current.items).toBe(newItems);
  });

  it('多个 StoreProvider 实例各有独立状态', () => {
    const sharedDef = createStore<{ value: number }>({
      name: 'multi-provider',
      initialState: { value: 0 },
    });

    const wrapperA = ({ children }: { children: React.ReactNode }) =>
      React.createElement(sharedDef.StoreProvider, { initialState: { value: 10 }, children });
    const wrapperB = ({ children }: { children: React.ReactNode }) =>
      React.createElement(sharedDef.StoreProvider, { initialState: { value: 20 }, children });

    const { result: resultA } = renderHook(() => sharedDef.useStore(), { wrapper: wrapperA });
    const { result: resultB } = renderHook(() => sharedDef.useStore(), { wrapper: wrapperB });

    expect(resultA.current.value).toBe(10);
    expect(resultB.current.value).toBe(20);
  });
});

// ─── createSimpleStore (new selector overloads) ──────────────────────────────

describe('createSimpleStore — selector overloads (new in PR)', () => {
  it('useStore with selector 返回选取的字段', () => {
    const store = createSimpleStore({ count: 5, name: 'test' });
    const { result } = renderHook(() => store.useStore((s) => s.count));
    expect(result.current).toBe(5);
  });

  it('useStore with selector 在对应字段更新时重新渲染', () => {
    const store = createSimpleStore({ count: 0, name: 'test' });
    const { result } = renderHook(() => store.useStore((s) => s.count));

    act(() => store.setState({ count: 42 }));
    expect(result.current).toBe(42);
  });

  it('useStore with selector + custom equalityFn 避免不必要重渲染', () => {
    const store = createSimpleStore({ nested: { x: 1 }, other: 0 });
    let renderCount = 0;
    const shallowEqual = (a: { x: number }, b: { x: number }) => a.x === b.x;

    const { result } = renderHook(() => {
      renderCount++;
      return store.useStore((s) => s.nested, shallowEqual);
    });

    const initialRenders = renderCount;
    // Update other, nested.x stays same value (new reference)
    act(() => store.setState({ nested: { x: 1 }, other: 99 }));

    expect(result.current.x).toBe(1);
    expect(renderCount).toBe(initialRenders);
  });

  it('useStore without selector 返回完整 state', () => {
    const store = createSimpleStore({ a: 1, b: 2 });
    const { result } = renderHook(() => store.useStore());
    expect(result.current).toEqual({ a: 1, b: 2 });
  });

  it('useDispatch 返回稳定的 setState 引用', () => {
    const store = createSimpleStore({ count: 0 });
    const { result, rerender } = renderHook(() => store.useDispatch());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

// ─── useGlobalStore — selector overloads (new in PR) ─────────────────────────

describe('useGlobalStore — selector overloads (new in PR)', () => {
  it('useGlobalStore with selector 返回选取的值', () => {
    const store = createSimpleStore({ count: 7, label: 'hello' });
    const { result } = renderHook(() => useGlobalStore(store, (s) => s.count));
    expect(result.current).toBe(7);
  });

  it('useGlobalStore with selector 在字段更新时重新渲染', () => {
    const store = createSimpleStore({ count: 0 });
    const { result } = renderHook(() => useGlobalStore(store, (s) => s.count));

    act(() => store.setState({ count: 100 }));
    expect(result.current).toBe(100);
  });

  it('useGlobalStore with selector + custom equalityFn 避免不必要重渲染', () => {
    const store = createSimpleStore({ nested: { x: 1 }, other: 0 });
    let renderCount = 0;
    const shallowEqual = (a: { x: number }, b: { x: number }) => a.x === b.x;

    const { result } = renderHook(() => {
      renderCount++;
      return useGlobalStore(store, (s) => s.nested, shallowEqual);
    });

    const initialRenders = renderCount;
    act(() => store.setState({ nested: { x: 1 }, other: 55 }));

    expect(result.current.x).toBe(1);
    expect(renderCount).toBe(initialRenders);
  });

  it('useGlobalStore without selector 返回完整 state', () => {
    const store = createSimpleStore({ x: 10, y: 20 });
    const { result } = renderHook(() => useGlobalStore(store));
    expect(result.current).toEqual({ x: 10, y: 20 });
  });

  it('useGlobalStore selector 值变化时触发重新渲染', () => {
    const store = createSimpleStore({ count: 0, name: 'a' });
    const { result } = renderHook(() => useGlobalStore(store, (s) => s.name));

    act(() => store.setState({ name: 'b' }));
    expect(result.current).toBe('b');
  });
});

// ─── useGlobalStoreDispatch (simplified to direct store.setState) ─────────────

describe('useGlobalStoreDispatch — simplified return (new in PR)', () => {
  it('返回的函数与 store.setState 是同一引用', () => {
    const store = createSimpleStore({ count: 0 });
    const { result } = renderHook(() => useGlobalStoreDispatch(store));
    expect(result.current).toBe(store.setState);
  });

  it('调用后正确更新 store 状态', () => {
    const store = createSimpleStore({ count: 0 });
    const { result: dispatchResult } = renderHook(() => useGlobalStoreDispatch(store));
    const { result: storeResult } = renderHook(() => useGlobalStore(store));

    act(() => dispatchResult.current({ count: 123 }));
    expect(storeResult.current.count).toBe(123);
  });

  it('函数形式 dispatch 基于前值更新', () => {
    const store = createSimpleStore({ count: 5 });
    const { result } = renderHook(() => useGlobalStoreDispatch(store));

    act(() => result.current((prev) => ({ count: prev.count * 2 })));
    expect(store.getState().count).toBe(10);
  });
});
