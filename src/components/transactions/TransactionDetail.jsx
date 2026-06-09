import { useState, useEffect } from 'react';
import { useTransaction } from '../../hooks/useTransaction';
import { updateTransactionStatus } from '../../services/transactions.service';
import { updateTaskStatus } from '../../services/transaction-services.service';
import { formatCurrency, calcBalance } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { NewAppModal } from '../new-application/NewAppModal';

export const TransactionDetail = ({ transactionId, onClose }) => {
  const { transaction, tasks, loading, error } = useTransaction(transactionId);
  const [view, setView] = useState('details'); 
  
  // NEW: Local state for instant checkbox toggling (Optimistic UI)
  const [localTasks, setLocalTasks] = useState([]);

  // Sync local tasks whenever the database loads them
  useEffect(() => {
    if (tasks) setLocalTasks(tasks);
  }, [tasks]);

  // Calculate if all tasks are done using the local instant state
  useEffect(() => {
    if (localTasks.length > 0 && transaction?.progress_status !== 'Complete') {
      const allDone = localTasks.every(t => t.task_status === 'Done');
      if (allDone) {
        handleMarkTransactionComplete();
      }
    }
  }, [localTasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkTransactionComplete = async () => {
    try {
      await updateTransactionStatus(transactionId, { progress_status: 'Complete' });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    
    // 1. OPTIMISTIC UPDATE: Instantly flip the switch in the UI
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, task_status: newStatus } : t
    ));

    // 2. BACKGROUND DB UPDATE
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to toggle task", err);
      // Revert the visual change if the database fails
      setLocalTasks(tasks); 
    }
  };

  if (loading && !transaction) {
    return <Modal isOpen={true} onClose={onClose}><div className="py-20 text-center">Loading...</div></Modal>;
  }

  if (error || !transaction) return null;

  if (view === 'edit') {
    return (
      <NewAppModal 
        isOpen={true} 
        initialData={transaction} 
        onClose={() => setView('details')} 
      />
    );
  }

  if (view === 'progress') {
    return (
      <Modal isOpen={true} title="UPDATE PROGRESS" onClose={() => setView('details')}>
        <div className="mb-6">
          <p className="text-gray-500 font-medium text-sm">PACKAGE ID: {transaction.package_id}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8 min-h-[200px] content-start">
          {/* Mapping over localTasks instead of tasks */}
          {localTasks?.map(task => {
            const isDone = task.task_status === 'Done';
            return (
              <label key={task.id} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <input 
                  type="checkbox" 
                  checked={isDone}
                  onChange={() => handleTaskToggle(task.id, task.task_status)}
                  className="w-5 h-5 rounded border-gray-300 text-black dark:text-white accent-black dark:accent-white focus:ring-black cursor-pointer"
                />
                <span className={`font-medium ${isDone ? 'line-through text-gray-400' : 'text-black dark:text-white'}`}>
                  {task.services?.name}
                </span>
              </label>
            );
          })}
          {(!localTasks || localTasks.length === 0) && (
            <p className="text-gray-400 col-span-2 italic">No services attached to this package.</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" onClick={() => setView('details')}>BACK</Button>
          <Button 
            onClick={() => {
              handleMarkTransactionComplete();
              setView('details');
            }}
          >
            COMPLETE
          </Button>
        </div>
      </Modal>
    );
  }

  const balance = calcBalance(transaction.packages?.price, transaction.paid_amount);

  return (
    <Modal isOpen={true} title="TRANSACTION DETAILS" onClose={onClose}>
      <div className="space-y-6 mb-8">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">COMPANY NAME</label>
          <div className="text-2xl font-black">{transaction.company_name}</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">CLIENT ID</label>
            <div className="font-medium">{transaction.clients?.id}</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">CLIENT NAME</label>
            <div className="font-medium">{transaction.clients?.name}</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">PHONE NUMBER</label>
            <div className="font-medium">{transaction.clients?.phone_number}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">PACKAGE</label>
            <div className="font-medium">{transaction.packages?.name}</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">AMOUNT PAID</label>
            <div className="font-medium">{formatCurrency(transaction.paid_amount)}</div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">BALANCE</label>
            <div className="font-medium">{formatCurrency(balance)}</div>
          </div>
        </div>

        {transaction.comments && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Comments</label>
             <div className="font-medium">{transaction.comments}</div>
          </div>
        )}
      </div>

      <div className="flex gap-4 border-t border-gray-100 dark:border-gray-800 pt-6 items-center">
        <Button onClick={() => setView('progress')} className="flex-1">UPDATE PROGRESS</Button>
        <Button variant="danger" onClick={() => setView('edit')} className="flex-1">EDIT</Button>
      </div>
      
      <div className="flex gap-4 mt-4">
        <Button 
          onClick={handleMarkTransactionComplete} 
          disabled={transaction.progress_status === 'Complete'}
          className="flex-1"
        >
          {transaction.progress_status === 'Complete' ? 'COMPLETED' : 'COMPLETE'}
        </Button>
        <Button variant="ghost" onClick={onClose} className="flex-1">BACK</Button>
      </div>
    </Modal>
  );
};