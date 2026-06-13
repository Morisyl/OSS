import { supabase } from '../lib/supabase';

export const getTasksByTransaction = async (transactionId) => {
  const { data, error } = await supabase
    .from('transaction_services')
    .select(`
      *,
      services (*),
      is_additional
    `)
    .eq('transaction_id', transactionId)
    .order('is_additional', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateTaskStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('transaction_services')
    .update({ task_status: status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};