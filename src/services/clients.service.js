import { supabase } from '../lib/supabase';

// Updated to search by ID instead of Phone
export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle(); 

  if (error) throw error;
  return data;
};

export const searchClients = async (query) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .ilike('name', `%${query}%`);

  if (error) throw error;
  return data;
};

export const createClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .upsert([clientData], { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateClient = async (id, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};