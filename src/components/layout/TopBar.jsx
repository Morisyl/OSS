import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../common/Button';
import { useUIStore } from '../../store/useUIStore';

export const TopBar = () => {
  const { username, signOut } = useAuth();
  const { toggleMobileSidebar } = useUIStore();

  return (
    <header className="h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 -ml-2 text-black dark:text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="font-bold text-xl tracking-tight text-black dark:text-white">
          ENOLIX <span className="text-gray-400 font-normal">Hub</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {username ? `Logged in as ${username}` : ''}
        </span>
        <ThemeToggle />
        <Button variant="ghost" onClick={signOut}>
          Logout
        </Button>
      </div>
    </header>
  );
};