import { supabase } from '../lib/supabase';

// 1. Creates transaction AND seeds tasks instantly
export const createTransaction = async (txData) => {
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert([txData])
    .select()
    .single();

  if (txError) throw txError;

  const { data: pkgServices, error: pkgError } = await supabase
    .from('package_services')
    .select('service_id')
    .eq('package_id', txData.package_id);

  if (pkgError) throw pkgError;

  if (pkgServices && pkgServices.length > 0) {
    const tasks = pkgServices.map(ps => ({
      transaction_id: transaction.id,
      service_id: ps.service_id,
      task_status: 'Pending'
    }));

    const { error: tasksError } = await supabase
      .from('transaction_services')
      .insert(tasks);
      
    if (tasksError) throw tasksError;
  }

  return transaction;
};

// 2. Used by the main Dashboard list
export const getActiveTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      clients (*),
      packages (*)
    `)
    //.eq('progress_status', 'Pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 3. Used by the Detail Panel
export const getTransactionById = async (id) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      clients (*),
      packages (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 4. Used by the Search Bar
export const searchTransactions = async (query) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      clients!inner (*)
    `)
    .or(`company_name.ilike.%${query}%,client_id.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 5. Used by the Edit Application Modal
export const updateTransaction = async (id, txData) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(txData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 6. Used by the Mark Complete and Task checkboxes
export const updateTransactionStatus = async (id, statusData) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(statusData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};