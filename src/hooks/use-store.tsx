"use client";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useSyncExternalStore,
  useMemo,
  useRef,
  useEffect,
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

function createStoreContext<T>() {
  return createContext<Store<T> | null>(null);
}

export function createStore<T extends object>(
  options: CreateStoreOptions<T>
): {
  StoreProvider: (props: { children: ReactNode; initialState?: Partial<T> }) => JSX.Element;
  useStore: () => T;
  useStoreDispatch: () => (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
  useStoreSelector: <R>(selector: (state: T) => R) => R;
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
    const listenersRef = useRef<Set<Listener>>(new Set());
    const [localState, dispatch] = useReducer(
      (s: T, a: Partial<T>) => ({ ...s, ...a }),
      initialState ? { ...options.initialState, ...initialState } : options.initialState
    );

    const stateRef = useRef(localState);
    stateRef.current = localState;

    const storeValue = useMemo<Store<T>>(
      () => ({
        getState: () => stateRef.current,
        setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
          const resolved = typeof partial === 'function'
            ? (partial as (prev: T) => Partial<T>)(stateRef.current)
            : partial;
          dispatch(resolved);
        },
        subscribe: (listener: Listener) => {
          listenersRef.current.add(listener);
          return () => listenersRef.current.delete(listener);
        },
      }),
      []
    );

    useEffect(() => {
      listenersRef.current.forEach((listener) => listener());
    }, [localState]);

    return (
      <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
    );
  }

  function useStore() {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`useStore must be used within a ${name}Provider`);
    }

    return useSyncExternalStore(
      store.subscribe,
      store.getState,
      store.getState
    );
  }

  function useStoreDispatch() {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`useStoreDispatch must be used within a ${name}Provider`);
    }
    return useCallback(
      (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
        store.setState(partial);
      },
      [store]
    );
  }

  function useStoreSelector<R>(selector: (state: T) => R): R {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`useStoreSelector must be used within a ${name}Provider`);
    }

    return useSyncExternalStore(
      store.subscribe,
      () => selector(store.getState()),
      () => selector(store.getState())
    );
  }

  return {
    StoreProvider,
    useStore,
    useStoreDispatch,
    useStoreSelector,
  };
}

export function createSimpleStore<T extends object>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener>();

  const store: Store<T> = {
    getState: () => state,
    setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
      const resolved = typeof partial === 'function'
        ? (partial as (prev: T) => Partial<T>)(state)
        : partial;
      state = { ...state, ...resolved };
      listeners.forEach((l) => l());
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return {
    ...store,
    useStore: function () {
      return useSyncExternalStore(
        store.subscribe,
        store.getState,
        store.getState
      );
    },
    useDispatch: function () {
      return useCallback(
        (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
          store.setState(partial);
        },
        []
      );
    },
  };
}

export function useGlobalStore<T extends object>(store: {
  getState: () => T;
  subscribe: (listener: Listener) => () => void;
}) {
  return useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );
}

export function useGlobalStoreDispatch<T extends object>(
  store: { setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void }
) {
  return useCallback(
    (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
      store.setState(partial);
    },
    [store]
  );
}
