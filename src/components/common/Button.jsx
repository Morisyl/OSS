import { Spinner } from './Spinner';

export const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  loading = false, 
  disabled = false,
  className = "" 
}) => {
  
  // Base styles: Pill shape, transition, bold text
  const baseStyle = "relative inline-flex items-center justify-center font-bold px-6 py-2.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Variants matching your storyboard (Black, White with border, Red)
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
    secondary: "bg-white text-black border-2 border-gray-200 hover:border-black dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:border-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white px-4"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {/* Hide text while loading, but maintain button width */}
      <span className={loading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
      
      {/* Show spinner in center when loading */}
      {loading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner color={variant === 'secondary' || variant === 'ghost' ? 'text-black dark:text-white' : 'text-white dark:text-black'} />
        </span>
      )}
    </button>
  );
};