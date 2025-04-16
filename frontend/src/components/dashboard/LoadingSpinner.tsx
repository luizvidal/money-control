interface LoadingSpinnerProps {
  size?: 'sm' | 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  // For sm size, just return the spinner without container
  if (size === 'sm') {
    return (
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-blue-500`}></div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-blue-500`}></div>
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
