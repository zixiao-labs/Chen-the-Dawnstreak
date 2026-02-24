"use client";
import { useState, useCallback, useRef, type ChangeEvent, type FormEvent } from 'react';

export type ValidationRule<T> = {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: T) => string | boolean | Promise<string | boolean>;
  custom?: (value: T) => string | boolean;
};

export type ValidationRules<T extends object> = {
  [K in keyof T]?: ValidationRule<T[K]>;
} & {};

type ValidationRulesWithStringKey<T extends object> = ValidationRules<T> & Record<string, ValidationRule<unknown>>;

export type FieldErrors<T extends object> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T extends object> {
  defaultValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T extends object> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  register: (name: keyof T, rules?: ValidationRule<T[keyof T]>) => {
    name: keyof T;
    value: T[keyof T];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    ref: (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => void;
  };
  handleSubmit: (e: FormEvent) => Promise<void>;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  reset: (values?: Partial<T>) => void;
  validate: () => boolean;
  validateField: (name: keyof T) => string | null;
}

export function useForm<T extends object>(options: UseFormOptions<T>): UseFormReturn<T> {
  const { defaultValues, validationRules: rawValidationRules = {}, onSubmit } = options;
  const validationRules = rawValidationRules as ValidationRulesWithStringKey<T>;

  const [values, setValuesState] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const refs = useRef<Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>(new Map());

  const validateField = useCallback(
    (name: keyof T): string | null => {
      const value = values[name];
      const rules = validationRules[name];

      if (!rules) return null;

      if (rules.required) {
        const requiredMsg = typeof rules.required === 'string' ? rules.required : '此字段为必填项';
        if (value === '' || value === undefined || value === null) {
          return requiredMsg;
        }
      }

      if (rules.minLength) {
        const minLen = typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value;
        const msg = typeof rules.minLength === 'string' ? rules.minLength : (rules.minLength as { message: string }).message;
        if (typeof value === 'string' && value.length < minLen) {
          return msg || `最小长度为 ${minLen}`;
        }
      }

      if (rules.maxLength) {
        const maxLen = typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value;
        const msg = typeof rules.maxLength === 'string' ? rules.maxLength : (rules.maxLength as { message: string }).message;
        if (typeof value === 'string' && value.length > maxLen) {
          return msg || `最大长度为 ${maxLen}`;
        }
      }

      if (rules.min !== undefined) {
        const minVal = typeof rules.min === 'number' ? rules.min : rules.min.value;
        const msg = typeof rules.min === 'string' ? rules.min : (rules.min as { message: string }).message;
        if (typeof value === 'number' && value < minVal) {
          return msg || `最小值为 ${minVal}`;
        }
      }

      if (rules.max !== undefined) {
        const maxVal = typeof rules.max === 'number' ? rules.max : rules.max.value;
        const msg = typeof rules.max === 'string' ? rules.max : (rules.max as { message: string }).message;
        if (typeof value === 'number' && value > maxVal) {
          return msg || `最大值为 ${maxVal}`;
        }
      }

  if (rules.pattern) {
    const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
    const msg = rules.pattern instanceof RegExp ? undefined : rules.pattern.message;
    if (typeof value === 'string' && !pattern.test(value)) {
      return msg || '格式不正确';
    }
  }

      if (rules.validate) {
        const result = rules.validate(value);
        if (result instanceof Promise) {
          return null;
        }
        if (typeof result === 'string') {
          return result;
        }
        if (result === false) {
          return '验证失败';
        }
      }

      if (rules.custom) {
        const result = rules.custom(value);
        if (typeof result === 'string') {
          return result;
        }
        if (result === false) {
          return '验证失败';
        }
      }

      return null;
    },
    [values, validationRules]
  );

  const validate = useCallback((): boolean => {
    const newErrors: FieldErrors<T> = {};
    let isValid = true;

    (Object.keys(validationRules) as (keyof T)[]).forEach((name) => {
      const error = validateField(name);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, validationRules]);

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const error = validateField(name);
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));
    }
  }, [errors, validateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const reset = useCallback((newValues?: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
    setErrors({});
    setTouched({});
  }, []);

  const handleChange = useCallback(
    (name: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setValue(name, value as T[keyof T]);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name);
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));
    },
    [validateField]
  );

  const register = useCallback(
    (name: keyof T, rules?: ValidationRule<T[keyof T]>) => {
      return {
        name,
        value: values[name],
        onChange: handleChange(name),
        onBlur: handleBlur(name),
        ref: (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => {
          refs.current.set(name, el);
        },
      };
    },
    [values, handleChange, handleBlur]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setTouched(
        Object.keys(validationRules).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof T, boolean>>
        )
      );

      const isValid = validate();
      if (!isValid) return;

      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit, validationRules]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    register,
    handleSubmit,
    setValue,
    setValues,
    reset,
    validate,
    validateField,
  };
}

export interface UseControllerOptions<T> {
  name: keyof T;
  rules?: ValidationRule<T[keyof T]>;
}

export interface UseControllerReturn<T, K extends keyof T> {
  field: {
    name: K;
    value: T[K];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    ref: (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => void;
  };
  fieldState: {
    error?: string;
    isTouched: boolean;
  };
}

export function useController<T extends object, K extends keyof T>(
  form: UseFormReturn<T>,
  options: UseControllerOptions<T>
): UseControllerReturn<T, K> {
  const { name, rules } = options;

  return {
    field: form.register(name, rules) as UseControllerReturn<T, K>['field'],
    fieldState: {
      error: form.errors[name] as string | undefined,
      isTouched: !!form.touched[name],
    },
  };
}
