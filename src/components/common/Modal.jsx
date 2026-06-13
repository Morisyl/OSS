import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
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
    // z-[100] ensures it sits above everything, including your navigation sidebar
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm m-0 p-0">
      
      {/* w-[80vw] forces EXACTLY 80% screen width
        h-[100vh] forces EXACTLY 100% screen height
        max-w-none overrides any default framework constraints
        rounded-none ensures it sits flush against the absolute top and bottom edges
      */}
      <div className="bg-white dark:bg-[#0F172A] w-[80vw] max-w-none h-[100vh] max-h-screen flex flex-col overflow-hidden border-x border-gray-200 dark:border-gray-800 rounded-none shadow-2xl">
        
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 flex-none bg-white dark:bg-[#0F172A]">
          <h2 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-black dark:hover:text-white rounded-full p-2 bg-gray-100 dark:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area - Passes height control entirely to the children */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0F172A]">
          {children}
        </div>

      </div>
    </div>
  );
};