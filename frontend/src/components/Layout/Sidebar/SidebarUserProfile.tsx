import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

interface SidebarUserProfileProps {
  userName: string;
  onLogout: () => void;
}

const SidebarUserProfile = ({ userName, onLogout }: SidebarUserProfileProps) => {
  // Get initials from user name (up to 2 characters)
  const getInitials = (name: string) => {
    if (!name) return '';
    
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium shadow-sm">
            {getInitials(userName)}
          </div>
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userName}
          </p>
          <button
            onClick={onLogout}
            className="mt-1 text-xs font-medium text-gray-500 hover:text-blue-600 flex items-center transition-colors duration-200 group"
          >
            <ArrowRightStartOnRectangleIcon className="mr-1 h-4 w-4 group-hover:text-blue-600 transition-colors duration-200" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarUserProfile;
