"use client";
import {
  forwardRef,
  useEffect,
  useRef,
  createElement,
  type ReactNode,
  type Ref,
  type RefObject,
  type CSSProperties,
} from 'react';

export interface CommonProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  slot?: string;
  id?: string;
  hidden?: boolean;
  // Standard DOM events — available on all components via CommonProps.
  // For reliable handling, add these to the component's eventMap.
  onClick?: (event: Event) => void;
  onDoubleClick?: (event: Event) => void;
  onKeyDown?: (event: Event) => void;
  onKeyUp?: (event: Event) => void;
  onMouseEnter?: (event: Event) => void;
  onMouseLeave?: (event: Event) => void;
  onContextMenu?: (event: Event) => void;
}

type EventMapEntry = string | { event: string; filter?: (e: Event, el: HTMLElement) => boolean };
type EventMap = Record<string, EventMapEntry>;

function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]): (el: T | null) => void {
  return (el: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref && typeof ref === 'object') {
        (ref as RefObject<T | null>).current = el;
      }
    }
  };
}

export function createComponent<P extends object>(
  tagName: string,
  eventMap?: EventMap,
) {
  const eventEntries = eventMap ? Object.entries(eventMap) : [];
  const normalizedEntries = eventEntries.map(([propName, entry]) => ({
    propName,
    domEvent: typeof entry === 'string' ? entry : entry.event,
    filter: typeof entry === 'string' ? undefined : entry.filter,
  }));
  const eventPropNames = new Set(normalizedEntries.map(({ propName }) => propName));

  const Component = forwardRef<HTMLElement, P & CommonProps>(
    (props, forwardedRef) => {
      const internalRef = useRef<HTMLElement>(null);

      const eventHandlers: Record<string, EventListener> = {};
      const elementProps: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(props as Record<string, unknown>)) {
        if (eventPropNames.has(key)) {
          if (typeof value === 'function') {
            eventHandlers[key] = value as EventListener;
          }
        } else if (key === 'className') {
          elementProps['class'] = value;
        } else if (key === 'children') {
          // handled separately via createElement third arg
        } else if (/^on[A-Z]/.test(key) && typeof value === 'function') {
          // Unmapped on* prop — do not pass to createElement
        } else {
          elementProps[key] = value;
        }
      }

      const handlersRef = useRef(eventHandlers);
      handlersRef.current = eventHandlers;

      useEffect(() => {
        const el = internalRef.current;
        if (!el || normalizedEntries.length === 0) return;

        const listeners: Array<[string, EventListener]> = [];

        for (const { propName, domEvent, filter } of normalizedEntries) {
          const listener: EventListener = (e: Event) => {
            const fn = handlersRef.current[propName];
            if (!fn) return;
            if (filter && !filter(e, el)) return;
            fn(e);
          };
          el.addEventListener(domEvent, listener);
          listeners.push([domEvent, listener]);
        }

        return () => {
          for (const [domEvent, listener] of listeners) {
            el.removeEventListener(domEvent, listener);
          }
        };
      }, []);

      return createElement(
        tagName,
        {
          ...elementProps,
          ref: mergeRefs(internalRef, forwardedRef),
        } as Record<string, unknown>,
        props.children as ReactNode,
      );
    },
  );

  Component.displayName = tagName;
  return Component;
}
