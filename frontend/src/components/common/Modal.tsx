import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode, useEffect, useRef } from 'react';
import '../../styles/z-index.css';
import ModalOverlay from './ModalOverlay';
import ModalPortal from './ModalPortal';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  title,
  onClose,
  children,
  showCloseButton = true
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen}>
      {/* Overlay that covers the entire screen */}
      <ModalOverlay isOpen={isOpen} onClose={onClose} />

      {/* Modal content */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 9999 }}>
        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Modal content */}
            <div
              ref={modalRef}
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md animate-fadeIn"
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {title}
                  </h3>
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 transition-colors duration-150 cursor-pointer"
                      onClick={onClose}
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal body */}
              <div className="px-6 py-4">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>

  );
};

export default Modal;
