import { supabase } from '../lib/supabase';

export const getPackages = async () => {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      package_services (
        services (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPackageWithServices = async (id) => {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      package_services (
        services (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createPackage = async (packageData) => {
  const { data, error } = await supabase
    .from('packages')
    .insert([packageData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePackage = async (id, packageData) => {
  const { data, error } = await supabase
    .from('packages')
    .update(packageData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePackage = async (id) => {
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};