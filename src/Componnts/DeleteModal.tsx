import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-xs z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        
        <h2 className="text-xl font-semibold text-gray-600">{title}</h2>

        
        <p className="text-gray-600 mt-2">{message}</p>

       
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition hover:cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 hover:cursor-pointer transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
