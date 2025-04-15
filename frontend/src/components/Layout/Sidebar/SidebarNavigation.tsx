import { ComponentType } from 'react';
import SidebarNavItem from './SidebarNavItem';

export interface NavItem {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

interface SidebarNavigationProps {
  items: NavItem[];
}

const SidebarNavigation = ({ items }: SidebarNavigationProps) => {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {items.map((item) => (
        <SidebarNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </nav>
  );
};

export default SidebarNavigation;
