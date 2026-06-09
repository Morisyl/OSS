export const TransactionBadge = ({ type, status }) => {
  const getStyles = () => {
    if (type === 'payment') {
      switch (status) {
        case 'Paid': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'Partial': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 'Unpaid': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default: return 'bg-gray-100 text-gray-700';
      }
    }
    
    if (type === 'progress') {
      switch (status) {
        case 'Complete': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'Pending': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStyles()}`}>
      {status}
    </span>
  );
};