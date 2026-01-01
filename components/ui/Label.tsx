import { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export default function Label({
  children,
  required = false,
  className = '',
  ...props
}: LabelProps) {
  return (
    <label
      className={`
        block text-sm font-medium text-gray-700 mb-1
        ${className}
      `}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
