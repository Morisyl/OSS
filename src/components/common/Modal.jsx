import { useEffect } from 'react';

export const Modal = ({ 
  title, 
  children, 
  onClose, 
  isOpen 
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Backdrop: Notice there is intentionally no onClick handler here to enforce the no-op rule */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white uppercase">
            {title}
          </h2>
          {/* Optional X button, though your designs prefer bottom action buttons */}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};