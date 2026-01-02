import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: Array<{ value: string | number; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options = [], children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 
          border rounded-md
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
          bg-white
          ${className}
        `}
        {...props}
      >
        {options.length > 0
          ? options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
          : children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
