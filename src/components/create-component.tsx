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
}

type EventMap = Record<string, string>;

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
  const eventPropNames = new Set(eventEntries.map(([propName]) => propName));

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
        } else {
          elementProps[key] = value;
        }
      }

      useEffect(() => {
        const el = internalRef.current;
        if (!el || eventEntries.length === 0) return;

        const listeners: Array<[string, EventListener]> = [];

        for (const [propName, domEvent] of eventEntries) {
          const handler = eventHandlers[propName];
          if (handler) {
            el.addEventListener(domEvent, handler);
            listeners.push([domEvent, handler]);
          }
        }

        return () => {
          for (const [domEvent, handler] of listeners) {
            el.removeEventListener(domEvent, handler);
          }
        };
      });

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
