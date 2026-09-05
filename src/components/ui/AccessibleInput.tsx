/**
 * Input Acessível com focus states e aria labels
 * WCAG 2.1 AA compliance
 */

import React from 'react';

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const AccessibleInput = React.forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(
  (
    {
      label,
      error,
      hint,
      required,
      icon,
      id,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const ariaDescribedBy = [
      error ? errorId : null,
      hint ? hintId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Label */}
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-label={label}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || undefined}
            className={`
              w-full px-4 py-2 rounded-lg border-2 transition-colors
              ${icon ? 'pl-10' : ''}
              ${
                error
                  ? 'border-red-500 bg-red-50 focus-ring-danger'
                  : 'border-slate-200 bg-white focus-ring'
              }
              ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-slate-900'}
              placeholder:text-slate-400
              disabled:opacity-60
            `}
            {...props}
          />
        </div>

        {/* Hint Text */}
        {hint && (
          <p id={hintId} className="text-xs text-slate-600">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-xs font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
