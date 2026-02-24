"use client";
import { useActionState } from 'react';

export type ServerAction<TState, TInput = FormData> = (
  prevState: TState,
  input: TInput,
) => Promise<TState>;

export interface UseServerActionReturn<TState, TInput> {
  state: TState;
  execute: (input: TInput) => void;
  isPending: boolean;
}

export function useServerAction<TState, TInput = FormData>(
  action: ServerAction<TState, TInput>,
  initialState: TState,
): UseServerActionReturn<TState, TInput> {
  const [state, dispatch, isPending] = useActionState(
    action as (state: Awaited<TState>, input: TInput) => Promise<TState>,
    initialState as Awaited<TState>,
  );
  return { state: state as TState, execute: dispatch as (input: TInput) => void, isPending };
}
