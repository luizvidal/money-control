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
  // Create a div element for the portal if it doesn't exist
  useEffect(() => {
    if (isOpen) {
      // Add a class to the body to prevent scrolling
      document.body.classList.add('overflow-hidden');
      
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
      }
    }

    return () => {
      if (isOpen) {
        // Remove the class from the body
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get the portal root element
  const portalRoot = document.getElementById('modal-portal-root');
  if (!portalRoot) return null;

  // Render the children in the portal
  return ReactDOM.createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    portalRoot
  );
};

export default ModalPortal;
