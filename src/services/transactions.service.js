import { supabase } from '../lib/supabase';

// 1. Creates transaction AND seeds tasks (Package services + Additional services)
export const createTransaction = async (txData) => {
  const { clientIds, additionalServiceIds, ...dbPayload } = txData;

  // 1. Insert transaction row
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert([dbPayload])
    .select()
    .single();
  if (txError) throw txError;

  // 2. Seed transaction_clients junction
  if (clientIds?.length) {
    const clientRows = clientIds.map(cid => ({
      transaction_id: transaction.id,
      client_id: cid
    }));
    const { error } = await supabase.from('transaction_clients').insert(clientRows);
    if (error) throw error;
  }

  // 3. Seed package tasks
  const { data: pkgServices, error: pkgError } = await supabase
    .from('package_services')
    .select('service_id')
    .eq('package_id', dbPayload.package_id);
  if (pkgError) throw pkgError;

  const packageTasks = (pkgServices || []).map(ps => ({
    transaction_id: transaction.id,
    service_id: ps.service_id,
    task_status: 'Pending',
    is_additional: false
  }));

  // 4. Seed additional service tasks
  const additionalTasks = (additionalServiceIds || []).map(sid => ({
    transaction_id: transaction.id,
    service_id: sid,
    task_status: 'Pending',
    is_additional: true
  }));

  const allTasks = [...packageTasks, ...additionalTasks];
  if (allTasks.length > 0) {
    const { error: tasksError } = await supabase
      .from('transaction_services')
      .insert(allTasks);
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
      transaction_clients(clients(*)),
      packages(*)
    `)
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
      transaction_clients(clients(*)),
      packages(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 4. Used by the Search Bar (Updated for Junction Table)
export const searchTransactions = async (query) => {
  if (!query) return [];

  // Find transaction IDs associated with matching Client IDs
  const { data: clientMatches } = await supabase
    .from('transaction_clients')
    .select('transaction_id')
    .ilike('client_id', `%${query}%`);

  const matchedTxIds = clientMatches?.map(m => m.transaction_id) || [];

  let queryBuilder = supabase
    .from('transactions')
    .select(`
      *,
      transaction_clients(clients(*)),
      packages(*)
    `);

  if (matchedTxIds.length > 0) {
    queryBuilder = queryBuilder.or(`company_name.ilike.%${query}%,id.in.(${matchedTxIds.join(',')})`);
  } else {
    queryBuilder = queryBuilder.ilike('company_name', `%${query}%`);
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// 5. Used by the Edit Application Modal
export const updateTransaction = async (id, txData) => {
  const { clientIds, additionalServiceIds, ...dbPayload } = txData;

  const { data, error } = await supabase
    .from('transactions')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  // Re-sync clients
  if (clientIds) {
    await supabase.from('transaction_clients').delete().eq('transaction_id', id);
    const rows = clientIds.map(cid => ({ transaction_id: id, client_id: cid }));
    if (rows.length) await supabase.from('transaction_clients').insert(rows);
  }

  // Re-sync additional services
  if (additionalServiceIds !== undefined) {
    // Delete only the additional tasks, leave package tasks untouched
    await supabase
      .from('transaction_services')
      .delete()
      .eq('transaction_id', id)
      .eq('is_additional', true);

    if (additionalServiceIds.length > 0) {
      const additionalRows = additionalServiceIds.map(sid => ({
        transaction_id: id,
        service_id: sid,
        task_status: 'Pending',
        is_additional: true
      }));
      await supabase.from('transaction_services').insert(additionalRows);
    }
  }

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