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
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <p className="text-center">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
