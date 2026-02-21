import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from '../hooks/use-mutation';

const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockClear();
  vi.stubGlobal('fetch', mockFetch);
});
afterEach(() => {
  vi.restoreAllMocks();
});

function makeResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    json: () => Promise.resolve(data),
  } as Response);
}

describe('useMutation', () => {
  it('初始状态：data=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useMutation('/api/submit'));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('成功 POST：返回数据并更新状态', async () => {
    const responseData = { id: 10, status: 'ok' };
    mockFetch.mockReturnValue(makeResponse(responseData));

    const { result } = renderHook(() =>
      useMutation<{ id: number; status: string }, { name: string }>('/api/submit')
    );

    let returned: { id: number; status: string } | undefined;
    await act(async () => {
      returned = await result.current.mutate({ name: 'Dawnstreak' });
    });

    expect(returned).toEqual(responseData);
    expect(result.current.data).toEqual(responseData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('使用 POST 方法并序列化 body', async () => {
    mockFetch.mockReturnValue(makeResponse({}));
    const { result } = renderHook(() => useMutation('/api/create'));

    await act(async () => {
      await result.current.mutate({ key: 'value' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/create',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('自定义 method (PUT)', async () => {
    mockFetch.mockReturnValue(makeResponse({}));
    const { result } = renderHook(() =>
      useMutation('/api/update', { method: 'PUT' })
    );

    await act(async () => {
      await result.current.mutate({ value: 1 });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/update',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('无 variables 时：body 为 undefined', async () => {
    mockFetch.mockReturnValue(makeResponse({}));
    const { result } = renderHook(() => useMutation('/api/trigger'));

    await act(async () => {
      await result.current.mutate();
    });

    const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
    expect(callArgs.body).toBeUndefined();
  });

  it('HTTP 错误：设置 error，抛出异常', async () => {
    mockFetch.mockReturnValue(makeResponse(null, false, 422));

    const { result } = renderHook(() => useMutation('/api/bad'));

    await act(async () => {
      await expect(result.current.mutate({ x: 1 })).rejects.toThrow('HTTP 422');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.loading).toBe(false);
  });

  it('网络错误：设置 error，抛出异常', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useMutation('/api/offline'));

    await act(async () => {
      await expect(result.current.mutate()).rejects.toThrow('Failed to fetch');
    });

    expect(result.current.error?.message).toBe('Failed to fetch');
  });

  it('reset：清空 data/error', async () => {
    mockFetch.mockReturnValue(makeResponse(null, false, 500));

    const { result } = renderHook(() => useMutation('/api/fail'));

    await act(async () => {
      await result.current.mutate().catch(() => {});
    });

    expect(result.current.error).not.toBeNull();

    act(() => result.current.reset());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('mutate 期间 loading=true', async () => {
    let resolve!: (v: Response) => void;
    mockFetch.mockReturnValue(new Promise<Response>((r) => { resolve = r; }));

    const { result } = renderHook(() => useMutation('/api/slow'));

    act(() => { result.current.mutate(); });

    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolve({ ok: true, status: 200, json: () => Promise.resolve({}) } as Response);
    });

    expect(result.current.loading).toBe(false);
  });
});
