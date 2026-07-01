import { supabase } from '../lib/supabase';
import { toCSV, downloadCSV } from '../utils/csv';

const flattenObject = (obj, prefix = '') => {
  if (!obj) return '';
  return Object.entries(obj)
    .map(([k, v]) => `${prefix}${k}=${v}`)
    .join('; ');
};

const flattenCustomData = (customData) => {
  if (!customData) return '';
  return Object.entries(customData)
    .map(([entity, fields]) => flattenObject(fields, `${entity}.`))
    .join('; ');
};

export const exportTransactionsToCSV = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      packages(name, price),
      transaction_clients(clients(id, name, phone_number, email)),
      transaction_services(task_status, is_additional, services(name))
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'created_at', label: 'Created At' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'company_dynamic_data', label: 'Company Details' },
    { key: 'clients', label: 'Clients' },
    { key: 'package_name', label: 'Package' },
    { key: 'package_price', label: 'Package Price' },
    { key: 'package_services', label: 'Package Services' },
    { key: 'additional_services', label: 'Additional Services' },
    { key: 'is_paid', label: 'Paid' },
    { key: 'progress_status', label: 'Progress Status' },
    { key: 'custom_data', label: 'Custom Fields' },
    { key: 'comments', label: 'Comments' }
  ];

  const rows = (data || []).map(t => {
    const clients = (t.transaction_clients || [])
      .map(tc => `${tc.clients?.id}:${tc.clients?.name}:${tc.clients?.phone_number}`)
      .join(' | ');

    const packageServices = (t.transaction_services || [])
      .filter(ts => !ts.is_additional)
      .map(ts => `${ts.services?.name}(${ts.task_status})`)
      .join(' | ');

    const additionalServices = (t.transaction_services || [])
      .filter(ts => ts.is_additional)
      .map(ts => `${ts.services?.name}(${ts.task_status})`)
      .join(' | ');

    return {
      id: t.id,
      created_at: t.created_at,
      company_name: t.company_name,
      company_dynamic_data: flattenObject(t.company_dynamic_data),
      clients,
      package_name: t.packages?.name,
      package_price: t.packages?.price,
      package_services: packageServices,
      additional_services: additionalServices,
      is_paid: t.is_paid ? 'Paid' : 'Not Paid',
      progress_status: t.progress_status,
      custom_data: flattenCustomData(t.custom_data),
      comments: t.comments
    };
  });

  const csv = toCSV(rows, columns);
  const filename = `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(filename, csv);
};