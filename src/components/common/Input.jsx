import { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  type = "text", 
  placeholder = "",
  helperText,
  className = "",
  ...props 
}, ref) => {
  
  const hasError = !!error;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`
          px-6 py-3 bg-transparent
          rounded-full outline-none transition-all duration-200
          text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-300
          font-bold text-center
          focus:ring-0
          ${hasError 
            ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border-2 border-black dark:border-blue-400/70 focus:border-blue-500 dark:focus:border-blue-400'
          }
        `}
        {...props}
      />
      
      {/* Error Message Display */}
      {hasError && (
        <span className="mt-1.5 text-sm text-red-500 font-medium ml-2">
          {error}
        </span>
      )}

      {/* Helper Text Display (only if no error) */}
      {!hasError && helperText && (
        <span className="mt-1.5 text-xs text-gray-500 ml-2">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';