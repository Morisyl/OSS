import { useEffect } from 'react';

export const Toast = ({ message, type = "success", onClose }) => {
  // Auto-dismiss timer (3.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-black text-white dark:bg-white dark:text-black"
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className={`${bgColors[type]} px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-3`}>
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
};