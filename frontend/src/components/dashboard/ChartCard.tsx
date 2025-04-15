import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  hasData: boolean;
  emptyMessage?: string;
}

const ChartCard = ({ 
  title, 
  children, 
  hasData, 
  emptyMessage = 'No data to display' 
}: ChartCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="h-64">
        {hasData ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
