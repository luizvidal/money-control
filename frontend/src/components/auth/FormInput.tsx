import { ChangeEvent } from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
}

const FormInput = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  isFirst = false,
  isLast = false,
}: FormInputProps) => {
  const baseClasses = "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200";
  
  const positionClasses = isFirst && isLast
    ? "rounded-md"
    : isFirst
      ? "rounded-t-md"
      : isLast
        ? "rounded-b-md"
        : "rounded-none";

  return (
    <div>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className={`${baseClasses} ${positionClasses}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormInput;
