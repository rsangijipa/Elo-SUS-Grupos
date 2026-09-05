/**
 * Select Acessível com focus states e aria labels
 * WCAG 2.1 AA compliance
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface AccessibleSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export const AccessibleSelect = React.forwardRef<
  HTMLSelectElement,
  AccessibleSelectProps
>(
  (
    {
      label,
      options,
      error,
      hint,
      required,
      placeholder,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

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
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-label={label}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || undefined}
            className={`
              w-full px-4 py-2 pr-10 rounded-lg border-2 appearance-none transition-colors
              ${
                error
                  ? 'border-red-500 bg-red-50 focus-ring-danger'
                  : 'border-slate-200 bg-white focus-ring'
              }
              ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-slate-900'}
              disabled:opacity-60
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          >
            <ChevronDown size={20} />
          </div>
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

AccessibleSelect.displayName = 'AccessibleSelect';
