import { useState, useEffect } from 'react';
import { searchTransactions } from '../services/transactions.service';

export const useSearch = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't search if query is empty or too short
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Debounce the search by 300ms
    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchTransactions(query.trim());
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup: clears the previous timeout if the user keeps typing
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
};