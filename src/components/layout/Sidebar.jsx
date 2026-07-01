import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { exportTransactionsToCSV } from '../../services/export.service';

export const Sidebar = () => {
  const pathname = usePathname();

  const [isExporting, setIsExporting] = useState(false);

 const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTransactionsToCSV();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const navItems = [
    { label: 'Transactions', path: '/home' },
    { label: 'Settings', path: '/settings' }
  ];

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        
        {/* Dynamic Navigation Items */}
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
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

        {/* Static Form Builder Link (Moved OUTSIDE the map function) */}
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
         onClick={handleExport}
         disabled={isExporting}
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
           {isExporting ? 'Exporting...' : 'Export CSV'}
         </span>
       </button>
        
      </nav>
    </aside>
  );
};