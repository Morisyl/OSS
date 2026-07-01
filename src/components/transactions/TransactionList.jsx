import { TransactionCard } from './TransactionCard';
import { Spinner } from '../common/Spinner';

export const TransactionList = ({ transactions, loading, error, onSelectTransaction }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading active transactions...</p>
      </div>
    );
  }

  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-2xl">{error}</div>;

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-20 text-gray-500 italic">No active transactions found.</div>
      ) : (
        transactions.map(t => (
          <TransactionCard 
            key={t.id} 
            transaction={t} 
            onClick={() => onSelectTransaction(t.id)} 
          />
        ))
      )}
    </div>
  );
};