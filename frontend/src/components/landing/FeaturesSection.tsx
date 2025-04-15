import { ReactNode } from 'react';
import FeatureCard from './FeatureCard';

// Feature data structure
export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

interface FeaturesSectionProps {
  features: Feature[];
}

const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Features
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Everything you need to manage your personal finances in one place. Simple, intuitive, and powerful tools to help you achieve your financial goals.
          </p>
        </div>

        <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
