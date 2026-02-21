import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetch } from '../hooks/use-fetch';

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
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  } as Response);
}

describe('useFetch', () => {
  it('初始状态：loading=false, data=null, error=null', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // 永不 resolve
    const { result } = renderHook(() => useFetch('/api/test'));
    // loading 在 useEffect 之前不会立刻变 true，但一旦 effect 运行就会
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('成功请求：设置 data，loading 变 false', async () => {
    const payload = { id: 1, name: 'Chen' };
    mockFetch.mockReturnValue(makeResponse(payload));

    const { result } = renderHook(() => useFetch<{ id: number; name: string }>('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(payload);
      expect(result.current.error).toBeNull();
    });
  });

  it('HTTP 错误：设置 error，data 为 null', async () => {
    mockFetch.mockReturnValue(makeResponse(null, false, 404));

    const { result } = renderHook(() => useFetch('/api/missing'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error!.message).toContain('HTTP 404');
    });
  });

  it('网络错误：设置 error', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error!.message).toBe('Network failure');
    });
  });

  it('url=null：不发请求，loading=false', () => {
    const { result } = renderHook(() => useFetch(null));
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('enabled=false：不发请求', () => {
    const { result } = renderHook(() =>
      useFetch('/api/test', { enabled: false })
    );
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('refetch：再次调用 fetch', async () => {
    const payload = { value: 42 };
    mockFetch.mockReturnValue(makeResponse(payload));

    const { result } = renderHook(() => useFetch<{ value: number }>('/api/test'));

    await waitFor(() => expect(result.current.data).toEqual(payload));

    mockFetch.mockReturnValue(makeResponse({ value: 99 }));
    act(() => result.current.refetch());

    await waitFor(() => {
      expect(result.current.data).toEqual({ value: 99 });
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('组件卸载时取消请求，不更新状态', async () => {
    let resolveFetch!: (v: Response) => void;
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { result, unmount } = renderHook(() => useFetch('/api/slow'));
    unmount();

    // 卸载后 resolve：不应触发状态更新（无 React 警告）
    act(() => {
      resolveFetch({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ done: true }),
      } as Response);
    });

    // data 仍为 null（未更新）
    expect(result.current.data).toBeNull();
  });
});
