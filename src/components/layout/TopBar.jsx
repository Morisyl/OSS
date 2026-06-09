import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../common/Button';

export const TopBar = () => {
  const { username, signOut } = useAuth();

  return (
    <header className="h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <div className="font-bold text-xl tracking-tight text-black dark:text-white">
        OSS <span className="text-gray-400 font-normal">Hub</span>
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