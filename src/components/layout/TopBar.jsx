import { useUIStore } from '../../store/useUIStore';

export const TopBar = () => {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <button
     onClick={toggleMobileSidebar}
     className="absolute top-4 left-4 md:top-8 md:left-8 z-30 p-2 text-blue-400"
     aria-label="Toggle menu"
   >
     <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
     </svg>
   </button>
  );
};