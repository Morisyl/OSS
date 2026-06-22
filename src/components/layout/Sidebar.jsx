import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const pathname = usePathname();

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
        <Link 
          href="/settings/forms" 
          className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group mt-4"
        >
          {/* Document/Form Icon */}
          <svg 
            className="w-6 h-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-bold uppercase tracking-widest text-sm text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
            Form Builder
          </span>
        </Link>
        
      </nav>
    </aside>
  );
};