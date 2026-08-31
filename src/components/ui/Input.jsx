import React from 'react';
import { clsx } from 'clsx';

export const Input = React.forwardRef(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2.5 bg-white text-black border border-neutral-300 rounded-md text-sm transition-colors duration-150',
            'placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
