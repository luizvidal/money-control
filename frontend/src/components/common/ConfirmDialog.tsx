import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import Modal from './Modal';
import ModalPortal from './ModalPortal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalPortal isOpen={isOpen}>
      <Modal
        isOpen={isOpen}
        title={title}
        onClose={onCancel}
        showCloseButton={false}
      >
        <div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
              onClick={onCancel}
              ref={cancelButtonRef}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 cursor-pointer ${confirmButtonClass}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </Modal>
    </ModalPortal>
  );
};

export default ConfirmDialog;
