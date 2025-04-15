import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  valueColor: string;
  icon?: ReactNode;
}

const SummaryCard = ({ title, value, valueColor, icon }: SummaryCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0 mr-4">
              <div className={`p-3 rounded-full ${valueColor.replace('text-', 'bg-').replace('-600', '-100')}`}>
                {icon}
              </div>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className={`mt-1 text-3xl font-semibold ${valueColor}`}>{value}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
