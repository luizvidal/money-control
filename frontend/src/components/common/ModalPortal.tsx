import { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
  isOpen: boolean;
}

/**
 * A component that renders its children in a portal at the root level of the DOM.
 * This ensures that modals and overlays are rendered outside of any stacking context
 * and can properly cover all other elements, including the sidebar.
 */
const ModalPortal = ({ children, isOpen }: ModalPortalProps) => {
  // Create the portal container on component mount, not just when isOpen changes
  useEffect(() => {
    // Create the portal container if it doesn't exist
    let portalRoot = document.getElementById('modal-portal-root');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'modal-portal-root';
      portalRoot.style.position = 'fixed';
      portalRoot.style.top = '0';
      portalRoot.style.left = '0';
      portalRoot.style.width = '100%';
      portalRoot.style.height = '100%';
      portalRoot.style.zIndex = '9999';
      portalRoot.style.pointerEvents = 'none';
      document.body.appendChild(portalRoot);
      console.log('Modal portal root created');
    }

    // Cleanup function to remove the portal container when component unmounts
    return () => {
      // We don't remove the portal root on unmount because it might be used by other modals
      // Just ensure body overflow is reset
      document.body.classList.remove('overflow-hidden');
    };
  }, []); // Empty dependency array means this runs once on mount

  // Handle body overflow when isOpen changes
  useEffect(() => {
    if (isOpen) {
      // Add a class to the body to prevent scrolling
      document.body.classList.add('overflow-hidden');
    } else {
      // Remove the class from the body
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get the portal root element
  const portalRoot = document.getElementById('modal-portal-root');

  // If portal root doesn't exist (which shouldn't happen), create it immediately
  if (!portalRoot) {
    console.warn('Modal portal root not found, creating it now');
    const newPortalRoot = document.createElement('div');
    newPortalRoot.id = 'modal-portal-root';
    newPortalRoot.style.position = 'fixed';
    newPortalRoot.style.top = '0';
    newPortalRoot.style.left = '0';
    newPortalRoot.style.width = '100%';
    newPortalRoot.style.height = '100%';
    newPortalRoot.style.zIndex = '9999';
    newPortalRoot.style.pointerEvents = 'none';
    document.body.appendChild(newPortalRoot);

    // Render the children in the portal
    return ReactDOM.createPortal(
      <div style={{ pointerEvents: 'auto' }}>
        {children}
      </div>,
      newPortalRoot
    );
  }

  // Render the children in the portal
  return ReactDOM.createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    portalRoot
  );
};

export default ModalPortal;
