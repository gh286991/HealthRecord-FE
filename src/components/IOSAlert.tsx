'use client';

import React from 'react';

interface IOSAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const IOSAlert: React.FC<IOSAlertProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmButtonText = 'Confirm', 
  cancelButtonText = 'Cancel' 
}) => {
  if (!isOpen) return null;

  return (
    // Use a transparent, blurred backdrop instead of a dark overlay
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-transparent backdrop-blur-md backdrop-saturate-150">
      <div className="bg-white rounded-2xl w-72 shadow-xl">
        <div className="px-4 pt-5 pb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 grid grid-cols-2">
          <button 
            onClick={onCancel} 
            className="w-full py-3 text-sm font-semibold text-blue-600 border-r border-gray-200 focus:outline-none"
          >
            {cancelButtonText}
          </button>
          <button 
            onClick={onConfirm} 
            className="w-full py-3 text-sm font-semibold text-red-600 focus:outline-none"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSAlert;
