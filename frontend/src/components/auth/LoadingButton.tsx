import { ReactNode } from 'react';

interface LoadingButtonProps {
  type?: 'button' | 'submit' | 'reset';
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const LoadingButton = ({
  type = 'submit',
  loading,
  disabled = false,
  onClick,
  children,
  className = '',
}: LoadingButtonProps) => {
  const baseClasses = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
    >
      {loading && (
        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

export default LoadingButton;
