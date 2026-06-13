import { useState, useEffect, useMemo } from 'react';
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

  const packageTasks = useMemo(() => tasks.filter(t => !t.is_additional), [tasks]);
  const additionalTasks = useMemo(() => tasks.filter(t => t.is_additional), [tasks]);

  return { transaction, tasks, packageTasks, additionalTasks, loading, error };
};