import { useEffect } from 'react';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  zIndex?: number;
}

/**
 * A component that renders a full-screen overlay.
 * This is used to dim the background when a modal is open.
 */
const ModalOverlay = ({ isOpen, onClose, zIndex = 9998 }: ModalOverlayProps) => {
  // Add overflow hidden to body to prevent scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex
      }}
      onClick={onClose}
    />
  );
};

export default ModalOverlay;
