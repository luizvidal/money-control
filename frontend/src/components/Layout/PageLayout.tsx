import { ReactNode } from 'react';

interface PageLayoutProps {
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
}

const PageLayout = ({ header, content, footer }: PageLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="flex-shrink-0">
        {header}
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {content}
      </div>
      
      {/* Fixed footer (pagination) */}
      {footer && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
