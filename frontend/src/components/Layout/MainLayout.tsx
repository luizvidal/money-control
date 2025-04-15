import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartPieIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MobileHeader from './MobileHeader';
import MobileSidebar from './MobileSidebar';
import Sidebar from './Sidebar/Sidebar';
import { NavItem } from './Sidebar/SidebarNavigation';

interface MainLayoutProps {
  children: ReactNode;
}

// Navigation items data
const navigationItems: NavItem[] = [
  {
    to: '/dashboard',
    icon: HomeIcon,
    label: 'Dashboard'
  },
  {
    to: '/transactions',
    icon: BanknotesIcon,
    label: 'Transactions'
  },
  {
    to: '/categories',
    icon: ChartPieIcon,
    label: 'Categories'
  },
  {
    to: '/goals',
    icon: ArrowTrendingUpIcon,
    label: 'Goals'
  }
];

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        navItems={navigationItems}
        userName={user?.name || ''}
        onLogout={handleLogout}
      />

      {/* Desktop sidebar */}
      <Sidebar
        navItems={navigationItems}
        userName={user?.name || ''}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <MobileHeader onOpenSidebar={handleOpenSidebar} />

        {/* Content */}
        <main className="flex-1 relative focus:outline-none bg-gray-50 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
