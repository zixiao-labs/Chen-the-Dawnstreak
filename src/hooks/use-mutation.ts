"use client";
import { useState, useCallback } from 'react';

export interface UseMutationOptions extends Omit<RequestInit, 'body' | 'signal'> {
  method?: string;
}

export interface UseMutationReturn<TData, TVariables> {
  mutate: (variables?: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions,
): UseMutationReturn<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        const { method = 'POST', ...rest } = options ?? {};

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...rest.headers,
          },
          body: variables !== undefined ? JSON.stringify(variables) : undefined,
          ...rest,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = (await res.json()) as TData;
        setData(json);
        setLoading(false);
        return json;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        throw error;
      }
    },
    [url, options],
  );

  return { mutate, data, loading, error, reset };
}
