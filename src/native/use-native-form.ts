"use client";
import { useState, useCallback } from 'react';
import type { ValidationRule, ValidationRules, FieldErrors } from '../hooks/use-form.js';

export interface UseNativeFormOptions<T extends object> {
  defaultValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseNativeFormReturn<T extends object> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  registerNative: (name: keyof T) => {
    value: T[keyof T];
    onChangeText: (text: string) => void;
    onBlur: () => void;
  };
  submit: () => Promise<void>;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  reset: (values?: Partial<T>) => void;
  validate: () => Promise<boolean>;
  validateField: (name: keyof T, valuesOverride?: T) => Promise<string | null>;
}

type ValidationRulesWithStringKey<T extends object> = ValidationRules<T> & Record<string, ValidationRule<unknown>>;

export function useNativeForm<T extends object>(options: UseNativeFormOptions<T>): UseNativeFormReturn<T> {
  const { defaultValues, validationRules: rawValidationRules = {}, onSubmit } = options;
  const validationRules = rawValidationRules as ValidationRulesWithStringKey<T>;

  const [values, setValuesState] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    async (name: keyof T, valuesOverride?: T): Promise<string | null> => {
      const currentValues = valuesOverride || values;
      const value = currentValues[name];
      const rules = validationRules[name];

      if (!rules) return null;

      if (rules.required) {
        const requiredMsg = typeof rules.required === 'string' ? rules.required : '此字段为必填项';
        if (value === '' || value === undefined || value === null) return requiredMsg;
      }

      if (rules.minLength) {
        const minLen = typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value;
        const msg = typeof rules.minLength === 'object' ? rules.minLength.message : undefined;
        if (typeof value === 'string' && value.length < minLen) return msg || `最小长度为 ${minLen}`;
      }

      if (rules.maxLength) {
        const maxLen = typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value;
        const msg = typeof rules.maxLength === 'object' ? rules.maxLength.message : undefined;
        if (typeof value === 'string' && value.length > maxLen) return msg || `最大长度为 ${maxLen}`;
      }

      if (rules.min !== undefined) {
        const minVal = typeof rules.min === 'number' ? rules.min : rules.min.value;
        const msg = typeof rules.min === 'object' ? rules.min.message : undefined;
        if (typeof value === 'number' && value < minVal) return msg || `最小值为 ${minVal}`;
      }

      if (rules.max !== undefined) {
        const maxVal = typeof rules.max === 'number' ? rules.max : rules.max.value;
        const msg = typeof rules.max === 'object' ? rules.max.message : undefined;
        if (typeof value === 'number' && value > maxVal) return msg || `最大值为 ${maxVal}`;
      }

      if (rules.pattern) {
        const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
        const msg = rules.pattern instanceof RegExp ? undefined : rules.pattern.message;
        if (typeof value === 'string' && !pattern.test(value)) return msg || '格式不正确';
      }

      if (rules.validate) {
        const result = rules.validate(value);
        if (result instanceof Promise) {
          const resolvedResult = await result;
          if (typeof resolvedResult === 'string') return resolvedResult;
          if (resolvedResult === false) return '验证失败';
        } else {
          if (typeof result === 'string') return result;
          if (result === false) return '验证失败';
        }
      }

      if (rules.custom) {
        const result = rules.custom(value);
        if (typeof result === 'string') return result;
        if (result === false) return '验证失败';
      }

      return null;
    },
    [values, validationRules]
  );

  const validate = useCallback(async (): Promise<boolean> => {
    const newErrors: FieldErrors<T> = {};
    let valid = true;
    const fieldNames = Object.keys(validationRules) as (keyof T)[];
    for (const name of fieldNames) {
      const error = await validateField(name);
      if (error) { newErrors[name] = error; valid = false; }
    }
    setErrors(newErrors);
    return valid;
  }, [validateField, validationRules]);

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => {
      const nextValues = { ...prev, [name]: value };
      if (errors[name]) {
        validateField(name, nextValues).then((error) => {
          setErrors((prevErrors) => {
            const next = { ...prevErrors };
            if (error) {
              next[name] = error;
            } else {
              delete next[name];
            }
            return next;
          });
        });
      }
      return nextValues;
    });
  }, [errors, validateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const reset = useCallback((newValues?: Partial<T>) => {
    setValuesState(newValues ? { ...defaultValues, ...newValues } : defaultValues);
    setErrors({});
    setTouched({});
  }, [defaultValues]);

  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name).then((error) => {
        setErrors((prev) => {
          const next = { ...prev };
          if (error) {
            next[name] = error;
          } else {
            delete next[name];
          }
          return next;
        });
      });
    },
    [validateField]
  );

  const registerNative = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChangeText: (text: string) => {
        const currentValue = values[name];
        let convertedValue: T[keyof T];

        if (typeof currentValue === 'number') {
          const num = parseFloat(text);
          convertedValue = (isNaN(num) ? undefined : num) as T[keyof T];
        } else if (typeof currentValue === 'boolean') {
          convertedValue = (text === 'true' || text === '1') as T[keyof T];
        } else {
          convertedValue = text as T[keyof T];
        }

        setValue(name, convertedValue);
      },
      onBlur: handleBlur(name),
    }),
    [values, setValue, handleBlur]
  );

  const submit = useCallback(async () => {
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      )
    );
    const valid = await validate();
    if (!valid) return;
    setIsSubmitting(true);
    try {
      if (onSubmit) await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit, validationRules]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    registerNative,
    submit,
    setValue,
    setValues,
    reset,
    validate,
    validateField,
  };
}
