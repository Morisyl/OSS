import { useState, useEffect, useMemo } from 'react';
import { getTransactionById } from '../services/transactions.service';
import { getTasksByTransaction } from '../services/transaction-services.service';
import { subscribeToTransactionTasks, subscribeToTransactionRow } from '../services/realtime.service';

export const useTransaction = (transactionId) => {
  const [transaction, setTransaction] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactionData = async () => {
   try {
     setLoading(true);
     const [txData, tasksData] = await Promise.all([
       getTransactionById(transactionId),
       getTasksByTransaction(transactionId)
     ]);
     setTransaction(txData);
     setTasks(tasksData);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

  useEffect(() => {
    if (!transactionId) return;
    
    fetchTransactionData();

    const unsubscribeTasks = subscribeToTransactionTasks(
      transactionId,
      (updatedTask) => {
        setTasks((current) =>
          current.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task))
        );
      }
    );

   // Row-level changes (package_id, comments, is_paid, progress_status)
   // require a full refetch since the payload has no joined data.
   const unsubscribeRow = subscribeToTransactionRow(
     transactionId,
     () => fetchTransactionData()
    );

   return () => {
     unsubscribeTasks();
     unsubscribeRow();
    };
  }, [transactionId]);

  const packageTasks = useMemo(() => tasks.filter(t => !t.is_additional), [tasks]);
  const additionalTasks = useMemo(() => tasks.filter(t => t.is_additional), [tasks]);

  return { transaction, tasks, packageTasks, additionalTasks, loading, error, refetch: fetchTransactionData };
};