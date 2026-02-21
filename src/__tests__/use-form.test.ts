import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../hooks/use-form';

interface TestForm {
  username: string;
  password: string;
  age: number;
}

function makeForm(overrides?: Partial<Parameters<typeof useForm<TestForm>>[0]>) {
  return renderHook(() =>
    useForm<TestForm>({
      defaultValues: { username: '', password: '', age: 0 },
      ...overrides,
    })
  );
}

describe('useForm — 初始状态', () => {
  it('values 等于 defaultValues', () => {
    const { result } = makeForm();
    expect(result.current.values).toEqual({ username: '', password: '', age: 0 });
  });

  it('没有错误，isValid=true，isSubmitting=false', () => {
    const { result } = makeForm();
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });
});

describe('useForm — setValue / setValues / reset', () => {
  it('setValue 更新单个字段', () => {
    const { result } = makeForm();
    act(() => result.current.setValue('username', 'Chen'));
    expect(result.current.values.username).toBe('Chen');
  });

  it('setValues 批量更新', () => {
    const { result } = makeForm();
    act(() => result.current.setValues({ username: 'Chen', age: 20 }));
    expect(result.current.values.username).toBe('Chen');
    expect(result.current.values.age).toBe(20);
  });

  it('reset 清空错误和 touched', () => {
    const { result } = makeForm({
      validationRules: { username: { required: true } },
    });
    // 触发一个错误
    act(() => result.current.validate());
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

    act(() => result.current.reset());
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('reset 可以带新的初始值', () => {
    const { result } = makeForm();
    act(() => result.current.reset({ username: 'newUser' }));
    expect(result.current.values.username).toBe('newUser');
  });
});

describe('useForm — validateField', () => {
  it('required=true：空字符串返回错误', () => {
    const { result } = makeForm({
      validationRules: { username: { required: true } },
    });
    expect(result.current.validateField('username')).toBe('此字段为必填项');
  });

  it('required=string：使用自定义消息', () => {
    const { result } = makeForm({
      validationRules: { username: { required: '用户名不能为空' } },
    });
    expect(result.current.validateField('username')).toBe('用户名不能为空');
  });

  it('required：有值时返回 null', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'Chen', password: '', age: 0 },
        validationRules: { username: { required: true } },
      })
    );
    expect(result.current.validateField('username')).toBeNull();
  });

  it('minLength：字符串过短返回错误', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'ab', password: '', age: 0 },
        validationRules: { username: { minLength: 5 } },
      })
    );
    expect(result.current.validateField('username')).toContain('5');
  });

  it('minLength：对象形式使用自定义消息', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'ab', password: '', age: 0 },
        validationRules: {
          username: { minLength: { value: 5, message: '太短了' } },
        },
      })
    );
    expect(result.current.validateField('username')).toBe('太短了');
  });

  it('maxLength：字符串过长返回错误', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'toolongname', password: '', age: 0 },
        validationRules: { username: { maxLength: 5 } },
      })
    );
    expect(result.current.validateField('username')).toContain('5');
  });

  it('min：数值过小返回错误', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: '', password: '', age: -1 },
        validationRules: { age: { min: 0 } },
      })
    );
    expect(result.current.validateField('age')).toContain('0');
  });

  it('max：数值过大返回错误', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: '', password: '', age: 150 },
        validationRules: { age: { max: 120 } },
      })
    );
    expect(result.current.validateField('age')).toContain('120');
  });

  it('pattern：RegExp 不匹配返回 "格式不正确"', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'invalid-email', password: '', age: 0 },
        validationRules: {
          username: { pattern: /^[a-z]+@[a-z]+\.[a-z]+$/ },
        },
      })
    );
    expect(result.current.validateField('username')).toBe('格式不正确');
  });

  it('pattern：对象形式使用自定义消息', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: '123', password: '', age: 0 },
        validationRules: {
          username: {
            pattern: { value: /^[a-z]+$/, message: '只能包含小写字母' },
          },
        },
      })
    );
    expect(result.current.validateField('username')).toBe('只能包含小写字母');
  });

  it('validate 函数：返回 false 时错误为 "验证失败"', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'bad', password: '', age: 0 },
        validationRules: {
          username: { validate: () => false },
        },
      })
    );
    expect(result.current.validateField('username')).toBe('验证失败');
  });

  it('validate 函数：返回字符串消息', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'bad', password: '', age: 0 },
        validationRules: {
          username: { validate: () => '自定义验证失败' },
        },
      })
    );
    expect(result.current.validateField('username')).toBe('自定义验证失败');
  });

  it('validate 函数：返回 true 时无错误', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'good', password: '', age: 0 },
        validationRules: {
          username: { validate: () => true },
        },
      })
    );
    expect(result.current.validateField('username')).toBeNull();
  });

  it('custom 函数：返回字符串消息', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'admin', password: '', age: 0 },
        validationRules: {
          username: { custom: (v) => (v === 'admin' ? '不能使用保留用户名' : true) },
        },
      })
    );
    expect(result.current.validateField('username')).toBe('不能使用保留用户名');
  });

  it('没有规则时返回 null', () => {
    const { result } = makeForm();
    expect(result.current.validateField('username')).toBeNull();
  });
});

describe('useForm — validate (全量)', () => {
  it('有错误时返回 false，设置 errors', () => {
    const { result } = makeForm({
      validationRules: {
        username: { required: true },
        password: { required: true },
      },
    });

    let valid!: boolean;
    act(() => { valid = result.current.validate(); });

    expect(valid).toBe(false);
    expect(result.current.errors.username).toBeTruthy();
    expect(result.current.errors.password).toBeTruthy();
  });

  it('无错误时返回 true', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'Chen', password: '123456', age: 20 },
        validationRules: { username: { required: true } },
      })
    );

    let valid!: boolean;
    act(() => { valid = result.current.validate(); });

    expect(valid).toBe(true);
    expect(result.current.errors).toEqual({});
  });
});

describe('useForm — handleSubmit', () => {
  it('验证失败时不调用 onSubmit', async () => {
    const onSubmit = vi.fn();
    const { result } = makeForm({
      validationRules: { username: { required: true } },
      onSubmit,
    });

    const fakeEvent = { preventDefault: vi.fn() } as never;
    await act(async () => { await result.current.handleSubmit(fakeEvent); });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('验证通过时调用 onSubmit 并传递 values', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'Chen', password: 'secret', age: 20 },
        validationRules: { username: { required: true } },
        onSubmit,
      })
    );

    const fakeEvent = { preventDefault: vi.fn() } as never;
    await act(async () => { await result.current.handleSubmit(fakeEvent); });

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'Chen',
      password: 'secret',
      age: 20,
    });
  });

  it('handleSubmit 期间 isSubmitting=true', async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((r) => { resolve = r; }));

    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'Chen', password: 'pass', age: 1 },
        onSubmit,
      })
    );

    const fakeEvent = { preventDefault: vi.fn() } as never;
    act(() => { result.current.handleSubmit(fakeEvent); });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => { resolve(); });
    expect(result.current.isSubmitting).toBe(false);
  });
});

describe('useForm — register', () => {
  it('register 返回包含 name 和 value 的对象', () => {
    const { result } = renderHook(() =>
      useForm<TestForm>({
        defaultValues: { username: 'initial', password: '', age: 0 },
      })
    );

    const field = result.current.register('username');
    expect(field.name).toBe('username');
    expect(field.value).toBe('initial');
    expect(typeof field.onChange).toBe('function');
    expect(typeof field.onBlur).toBe('function');
  });
});
