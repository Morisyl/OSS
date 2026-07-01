import { useState, useEffect } from 'react';
import { getActiveTransactions } from '../services/transactions.service';
import { subscribeToTransactions } from '../services/realtime.service';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
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

  useEffect(() => {
    fetchTransactions();

    // Setup Real-time Subscription
    const unsubscribe = subscribeToTransactions(
      // onInsert: payload has no joins, refetch full joined list
     () => fetchTransactions(),
     // onUpdate: same reason, refetch full joined list
     () => fetchTransactions()
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { transactions, loading, error, refetch: fetchTransactions };
};