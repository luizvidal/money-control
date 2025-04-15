import { ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarNavItemProps {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const SidebarNavItem = ({ to, icon: Icon, label }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
        isActive 
          ? 'text-blue-600' 
          : 'text-gray-400 group-hover:text-gray-500'
      }`} />
      {label}
    </Link>
  );
};

export default SidebarNavItem;
