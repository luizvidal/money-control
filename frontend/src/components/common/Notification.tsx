import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import '../../styles/z-index.css';
import ModalPortal from './ModalPortal';

type NotificationType = 'success' | 'error';

interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification = ({
  type,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000
}: NotificationProps) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isVisible && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const icon = type === 'success' ? (
    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
  ) : (
    <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
  );

  return (
    <ModalPortal isOpen={isVisible}>
      <div className="fixed top-4 right-4 z-notification animate-fadeIn">
        <div className={`rounded-md ${bgColor} p-4 border ${borderColor}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${textColor}`}>{message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex rounded-md p-1.5 ${bgColor} ${textColor} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'success' ? 'green' : 'red'}-50 focus:ring-${type === 'success' ? 'green' : 'red'}-600`}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default Notification;
