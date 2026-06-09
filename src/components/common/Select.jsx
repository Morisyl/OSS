import { forwardRef } from 'react';

export const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder = "Select an option",
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
      
      <select
        ref={ref}
        className={`
          px-4 py-3 bg-gray-100 dark:bg-gray-800 
          rounded-full outline-none transition-all duration-200
          text-black dark:text-white appearance-none cursor-pointer
          focus:ring-2 focus:ring-black dark:focus:ring-white
          ${hasError 
            ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border border-transparent'
          }
        `}
        {...props}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Error Message Display */}
      {hasError && (
        <span className="mt-1.5 text-sm text-red-500 font-medium ml-2">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';