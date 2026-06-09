import { useUIStore } from '../../store/useUIStore';

export const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <button 
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};