import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-5 shadow-md">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-base text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
