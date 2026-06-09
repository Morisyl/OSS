import { useState, useEffect } from 'react';
import { getTransactionById } from '../services/transactions.service';
import { getTasksByTransaction } from '../services/transaction-services.service';
import { subscribeToTransactionTasks } from '../services/realtime.service';

export const useTransaction = (transactionId) => {
  const [transaction, setTransaction] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!transactionId) return;

    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        // Fetch the parent transaction and its children tasks simultaneously
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

    fetchTransactionData();

    // Subscribe to task updates (e.g., when operator B clicks "Done" on a task)
    const unsubscribe = subscribeToTransactionTasks(
      transactionId,
      (updatedTask) => {
        setTasks((current) =>
          current.map((task) => (task.id === updatedTask.id ? { ...task, ...updatedTask } : task))
        );
      }
    );

    return () => unsubscribe();
  }, [transactionId]);

  return { transaction, tasks, loading, error };
};