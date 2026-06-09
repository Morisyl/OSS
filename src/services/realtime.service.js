import { supabase } from '../lib/supabase';

export const subscribeToTransactions = (onInsert, onUpdate) => {
  const channel = supabase.channel('public:transactions')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'transactions' },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();

  // Return the cleanup function directly
  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToTransactionTasks = (transactionId, onUpdate) => {
  const channel = supabase.channel(`public:transaction_services:${transactionId}`)
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'transaction_services',
        filter: `transaction_id=eq.${transactionId}` 
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();

  // Return the cleanup function directly
  return () => {
    supabase.removeChannel(channel);
  };
};