import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionBadge } from './TransactionBadge';

export const TransactionCard = ({ transaction, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer animate-scale-in"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white leading-tight">
            {transaction.company_name}
          </h3>
          <p className="text-sm font-medium text-gray-500 mt-1">
            ID: {transaction.transaction_clients?.[0]?.clients?.id} • {transaction.transaction_clients?.[0]?.clients?.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-500 dark:text-gray-400">{formatDate(transaction.created_at)}</div>
          <div className="text-lg font-bold text-black dark:text-white mt-1">{formatCurrency(transaction.packages?.price)}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
        <TransactionBadge type="payment" status={transaction.payment_status} />
        <TransactionBadge type="progress" status={transaction.progress_status} />
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-auto bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {transaction.packages?.name}
        </span>
      </div>
    </div>
  );
};