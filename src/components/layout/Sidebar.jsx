import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ExportModal } from '../export/ExportModal';
import { useUIStore } from '../../store/useUIStore';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

export const Sidebar = () => {
  const pathname = usePathname();
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { username, signOut } = useAuth();
  const [isExportOpen, setIsExportOpen] = useState(false);

  

  return (

    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={closeMobileSidebar}
        />
      )}

    <aside
        className={`w-72 bg-black border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        
        {/* Dynamic Navigation Items */}

        {/* Navigation */}
        {[
          { label: 'Transactions', path: '/home' },
          { label: 'Settings', path: '/settings' },
          { label: 'Form Builder', path: '/settings/forms' },
        ].map((item) => {
          const isActive = pathname === item.path || (item.path !== '/home' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={closeMobileSidebar}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}


        {/* Export Transactions to CSV */}
       <button
         onClick={() => setIsExportOpen(true)}
         className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group mt-2 disabled:opacity-50 text-left"
       >
         <svg
           className="w-6 h-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
         >
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 10l5 5 5-5M12 15V3" />
         </svg>
         <span className="font-bold uppercase tracking-widest text-sm text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
           Export CSV
         </span>
       </button>

       <hr className="border-white/10 my-4" />

       <div className="px-6 py-3 flex items-center justify-between">
         <span className="text-sm font-medium text-gray-400">
           {username ? `Logged in as ${username}` : ''}
         </span>
         <ThemeToggle />
       </div>

       <button
         onClick={signOut}
         className="text-left px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm text-red-400 hover:bg-white/5 transition-colors"
       >
         Logout
       </button>
        
      </nav>
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </aside></>
  );
};