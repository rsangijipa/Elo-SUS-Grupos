import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ZodSchema } from 'zod';

type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useZodForm<T extends Record<string, unknown>>(schema: ZodSchema<T>, initialValues: T) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<FormErrors<T>>({});

    const validate = useCallback((nextValues: T = values) => {
        const result = schema.safeParse(nextValues);

        if (result.success) {
            setErrors({});
            return { success: true as const, data: result.data };
        }

        const nextErrors: FormErrors<T> = {};

        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof T | undefined;
            if (field && !nextErrors[field]) {
                nextErrors[field] = issue.message;
            }
        }

        setErrors(nextErrors);
        return { success: false as const, errors: nextErrors };
    }, [schema, values]);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }, []);

    const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    }, []);

    return {
        values,
        errors,
        handleChange,
        validate,
        setValues,
        setErrors,
        setFieldValue
    };
}
