import { ReactNode } from 'react';
import Label from './Label';

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export default function FormField({
  label,
  error,
  required = false,
  children,
  htmlFor,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
