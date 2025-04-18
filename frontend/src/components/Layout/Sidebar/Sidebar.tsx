import { ReactNode } from 'react';
import '../../../styles/z-index.css';
import SidebarNavigation, { NavItem } from './SidebarNavigation';
import SidebarUserProfile from './SidebarUserProfile';

interface SidebarProps {
  navItems: NavItem[];
  userName: string;
  onLogout: () => void;
  logo?: ReactNode;
}

const Sidebar = ({ navItems, userName, onLogout, logo }: SidebarProps) => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col relative" style={{ zIndex: 10 }}>
      <div className="flex flex-col flex-grow overflow-y-auto bg-white shadow-[1px_0_5px_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center flex-shrink-0 px-4 py-5">
          {logo || (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <h1 className="text-xl font-bold text-blue-600">Money Control</h1>
            </div>
          )}
        </div>

        <div className="mt-2 flex-grow flex flex-col">
          <SidebarNavigation items={navItems} />
        </div>

        <SidebarUserProfile
          userName={userName}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;
