import React from 'react';

interface FormFieldErrorProps {
  error?: string | null;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-1 mt-1 text-[11px] text-error font-medium animate-in fade-in duration-100 ${className}`}>
      <span className="material-symbols-outlined text-[14px] flex-shrink-0">error</span>
      <span>{error}</span>
    </div>
  );
};
