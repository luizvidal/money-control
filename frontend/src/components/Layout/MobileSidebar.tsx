import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/sidebar-animations.css';
import '../../styles/z-index.css';
import SidebarNavigation, { NavItem } from './Sidebar/SidebarNavigation';
import SidebarUserProfile from './Sidebar/SidebarUserProfile';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  userName: string;
  onLogout: () => void;
}

const MobileSidebar = ({ isOpen, onClose, navItems, userName, onLogout }: MobileSidebarProps) => {
  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render anything if the sidebar is closed
  if (!isOpen) return null;

  // Create portal content
  const sidebarContent = (
    <div className="fixed inset-0 flex z-[9999] md:hidden" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 animate-fadeIn"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-[1px_0_5px_0_rgba(0,0,0,0.05)] animate-slideInFromLeft">
        {/* Close button */}
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <h1 className="text-xl font-bold text-blue-600">Money Control</h1>
          </div>

          <div className="mt-5">
            <SidebarNavigation
              items={navItems}
              onNavItemClick={onClose}
            />
          </div>
        </div>

        <SidebarUserProfile
          userName={userName}
          onLogout={onLogout}
        />
      </div>

      <div className="flex-shrink-0 w-14">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );

  // Use createPortal to render the sidebar at the root level
  // Make sure the portal container exists
  let portalContainer = document.getElementById('sidebar-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'sidebar-portal';
    document.body.appendChild(portalContainer);
  }

  return createPortal(
    sidebarContent,
    portalContainer
  );
};

export default MobileSidebar;
