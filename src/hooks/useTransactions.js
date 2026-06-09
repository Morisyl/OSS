import { useState, useEffect } from 'react';
import { getActiveTransactions } from '../services/transactions.service';
import { subscribeToTransactions } from '../services/realtime.service';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const data = await getActiveTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Setup Real-time Subscription
    const unsubscribe = subscribeToTransactions(
      // onInsert handler: Add new transaction to the top of the list instantly
      (newRow) => {
        setTransactions((current) => [newRow, ...current]);
      },
      // onUpdate handler: Find the existing row and swap it with the new data
      (updatedRow) => {
        setTransactions((current) => 
          current.map((t) => (t.id === updatedRow.id ? { ...t, ...updatedRow } : t))
        );
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { transactions, loading, error };
};