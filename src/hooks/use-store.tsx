"use client";
import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useRef,
  type ReactNode,
  type JSX,
} from 'react';

type Listener = () => void;

interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
}

export interface CreateStoreOptions<T> {
  name?: string;
  initialState: T;
}

/**
 * 构造一个 React 之外的外部 store。state 作为闭包变量持有，
 * 避免依赖 React render / useEffect 的提交时机，天然规避并发模式 tearing。
 */
function makeExternalStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState: (partial) => {
      const resolved =
        typeof partial === 'function'
          ? (partial as (prev: T) => Partial<T>)(state)
          : partial;
      state = { ...state, ...resolved };
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function createStoreContext<T>() {
  return createContext<Store<T> | null>(null);
}

/**
 * 在 React Context 外用外部 store 持有状态。
 *
 * 旧实现用 useReducer + useRef + useEffect 通知订阅者 —— 并发模式下
 * stateRef 在 render 阶段被写入，订阅者通知却在 commit 阶段发生，
 * 会产生 tearing；现在改为每个 StoreProvider 实例自有一个 makeExternalStore，
 * 读写都跑在 React 之外，useSyncExternalStore 做一致性保证。
 */
export function createStore<T extends object>(
  options: CreateStoreOptions<T>
): {
  StoreProvider: (props: { children: ReactNode; initialState?: Partial<T> }) => JSX.Element;
  useStore: () => T;
  useStoreDispatch: () => (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
  useStoreSelector: <R>(selector: (state: T) => R, equalityFn?: (a: R, b: R) => boolean) => R;
} {
  const name = options.name || `store_${Math.random().toString(36).slice(2)}`;
  const StoreContext = createStoreContext<T>();

  function StoreProvider({
    children,
    initialState,
  }: {
    children: ReactNode;
    initialState?: Partial<T>;
  }) {
    // 每个 Provider 实例一份外部 store。initialState 只在首次挂载时生效。
    const storeRef = useRef<Store<T> | null>(null);
    if (storeRef.current === null) {
      const initial = initialState
        ? { ...options.initialState, ...initialState }
        : options.initialState;
      storeRef.current = makeExternalStore<T>(initial);
    }
    return (
      <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
    );
  }

  function useStore(): T {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`useStore must be used within a ${name}Provider`);
    }
    return useSyncExternalStore(store.subscribe, store.getState, store.getState);
  }

  function useStoreDispatch() {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`useStoreDispatch must be used within a ${name}Provider`);
    }
    // store.setState 是稳定引用，直接返回即可
    return store.setState;
  }

  function useStoreSelector<R>(
    selector: (state: T) => R,
    equalityFn: (a: R, b: R) => boolean = Object.is,
  ): R {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`useStoreSelector must be used within a ${name}Provider`);
    }
    // 缓存最近一次的 selected 值，只要 equalityFn 相等就返回同一引用，
    // 防止 useSyncExternalStore 在 getSnapshot 返回非稳定引用时警告/死循环。
    const lastRef = useRef<{ state: T; selected: R } | null>(null);
    const getSelected = useCallback((): R => {
      const state = store.getState();
      if (lastRef.current && lastRef.current.state === state) {
        return lastRef.current.selected;
      }
      const next = selector(state);
      if (lastRef.current && equalityFn(lastRef.current.selected, next)) {
        // 值相等但 state 引用变了：更新 state 缓存，复用旧 selected
        lastRef.current = { state, selected: lastRef.current.selected };
        return lastRef.current.selected;
      }
      lastRef.current = { state, selected: next };
      return next;
    }, [store, selector, equalityFn]);

    return useSyncExternalStore(store.subscribe, getSelected, getSelected);
  }

  return {
    StoreProvider,
    useStore,
    useStoreDispatch,
    useStoreSelector,
  };
}

/**
 * 模块级全局单例 store。无需 Provider。
 */
export function createSimpleStore<T extends object>(initialState: T) {
  const store = makeExternalStore(initialState);

  function useStore(): T;
  function useStore<R>(selector: (state: T) => R, equalityFn?: (a: R, b: R) => boolean): R;
  function useStore<R>(
    selector?: (state: T) => R,
    equalityFn: (a: R, b: R) => boolean = Object.is,
  ): T | R {
    if (!selector) {
      return useSyncExternalStore(store.subscribe, store.getState, store.getState);
    }
    // 闭包缓存，稳定 getSnapshot 引用
    const lastRef = useRef<{ state: T; selected: R } | null>(null);
    const getSelected = useCallback((): R => {
      const state = store.getState();
      if (lastRef.current && lastRef.current.state === state) {
        return lastRef.current.selected;
      }
      const next = selector(state);
      if (lastRef.current && equalityFn(lastRef.current.selected, next)) {
        lastRef.current = { state, selected: lastRef.current.selected };
        return lastRef.current.selected;
      }
      lastRef.current = { state, selected: next };
      return next;
    }, [selector, equalityFn]);
    return useSyncExternalStore(store.subscribe, getSelected, getSelected);
  }

  function useDispatch() {
    return store.setState;
  }

  return {
    ...store,
    useStore,
    useDispatch,
  };
}

/**
 * 直接订阅任意外部 store（必须至少有 subscribe + getState）。
 * 可选 selector 用于切片订阅，只在 selected 值变化时重新渲染。
 */
export function useGlobalStore<T extends object>(store: {
  getState: () => T;
  subscribe: (listener: Listener) => () => void;
}): T;
export function useGlobalStore<T extends object, R>(
  store: {
    getState: () => T;
    subscribe: (listener: Listener) => () => void;
  },
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean,
): R;
export function useGlobalStore<T extends object, R>(
  store: {
    getState: () => T;
    subscribe: (listener: Listener) => () => void;
  },
  selector?: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is,
): T | R {
  if (!selector) {
    return useSyncExternalStore(store.subscribe, store.getState, store.getState);
  }
  const lastRef = useRef<{ state: T; selected: R } | null>(null);
  const getSelected = useCallback((): R => {
    const state = store.getState();
    if (lastRef.current && lastRef.current.state === state) {
      return lastRef.current.selected;
    }
    const next = selector(state);
    if (lastRef.current && equalityFn(lastRef.current.selected, next)) {
      lastRef.current = { state, selected: lastRef.current.selected };
      return lastRef.current.selected;
    }
    lastRef.current = { state, selected: next };
    return next;
  }, [store, selector, equalityFn]);
  return useSyncExternalStore(store.subscribe, getSelected, getSelected);
}

export function useGlobalStoreDispatch<T extends object>(
  store: { setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void }
) {
  return store.setState;
}
