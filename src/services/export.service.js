import { supabase } from '../lib/supabase';
import { toCSV, downloadCSV } from '../utils/csv';

const BUILTIN_FIELDS = [
  { key: 'id', label: 'Transaction ID', type: 'text' },
  { key: 'created_at', label: 'Created At', type: 'date' },
  { key: 'company_name', label: 'Company Name', type: 'text' },
  { key: 'clients', label: 'Clients', type: 'text' },
  { key: 'package_name', label: 'Package', type: 'categorical', options: [] },
  { key: 'package_price', label: 'Package Price', type: 'text' },
  { key: 'package_services', label: 'Package Services', type: 'text' },
  { key: 'additional_services', label: 'Additional Services', type: 'text' },
  { key: 'is_paid', label: 'Payment Status', type: 'categorical', options: ['Paid', 'Not Paid'] },
  { key: 'progress_status', label: 'Progress Status', type: 'categorical', options: ['Pending', 'Complete'] },
  { key: 'comments', label: 'Comments', type: 'text' }
];

export const getExportFieldCatalog = async () => {
  const [{ data: fields }, { data: packages }] = await Promise.all([
    supabase.from('form_fields').select('*'),
    supabase.from('packages').select('name')
  ]);

  const builtin = BUILTIN_FIELDS.map(f =>
    f.key === 'package_name' ? { ...f, options: (packages || []).map(p => p.name) } : f
  );

  const dynamic = (fields || []).map(f => ({
    key: f.target_entity === 'company' ? `company.${f.field_key}` : `custom.${f.target_entity}.${f.field_key}`,
    label: f.field_label,
    type: f.field_type === 'dropdown' ? 'categorical' : 'text',
    options: f.options || []
  }));

  return [...builtin, ...dynamic];
};

export const getColumnLabelSuggestions = async (fieldKey) => {
  const { data } = await supabase.from('export_column_labels').select('label').eq('field_key', fieldKey);
  return (data || []).map(d => d.label);
};

export const saveColumnLabel = async (fieldKey, label) => {
  await supabase.from('export_column_labels').upsert({ field_key: fieldKey, label }, { onConflict: 'field_key,label' });
};

export const getExportTemplates = async () => {
  const { data } = await supabase.from('export_templates').select('*').order('name');
  return data || [];
};

export const saveExportTemplate = async (name, config) => {
  const { error } = await supabase.from('export_templates').upsert({ name, config }, { onConflict: 'name' });
  if (error) throw error;
};

const buildRow = (t) => {
  const row = {
    id: t.id,
    created_at: t.created_at,
    company_name: t.company_name,
    clients: (t.transaction_clients || [])
      .map(tc => `${tc.clients?.id}: ${tc.clients?.name} (${tc.clients?.phone_number})`)
      .join('\n'),
    package_name: t.packages?.name,
    package_price: t.packages?.price,
    package_services: (t.transaction_services || [])
      .filter(ts => !ts.is_additional)
      .map(ts => `${ts.services?.name}: ${ts.task_status}`)
      .join('\n'),
    additional_services: (t.transaction_services || [])
      .filter(ts => ts.is_additional)
      .map(ts => `${ts.services?.name}: ${ts.task_status}`)
      .join('\n'),
    is_paid: t.is_paid ? 'Paid' : 'Not Paid',
    progress_status: t.progress_status,
    comments: t.comments
  };

  Object.entries(t.company_dynamic_data || {}).forEach(([k, v]) => {
    row[`company.${k}`] = v;
  });

  Object.entries(t.custom_data || {}).forEach(([entity, fields]) => {
    Object.entries(fields || {}).forEach(([k, v]) => {
      row[`custom.${entity}.${k}`] = v;
    });
  });

  return row;
};

export const exportTransactionsToCSV = async (config) => {
  const { fields, filters = {} } = config;

  let query = supabase
    .from('transactions')
    .select(`
      *,
      packages(name, price),
      transaction_clients(clients(id, name, phone_number, email)),
      transaction_services(task_status, is_additional, services(name))
    `)
    .order('created_at', { ascending: false });

  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data || []).map(buildRow);

  Object.entries(filters.categorical || {}).forEach(([key, value]) => {
    if (!value) return;
    rows = rows.filter(r => r[key] === value);
  });

  const csv = toCSV(rows, fields);
  downloadCSV(`transactions_export_${new Date().toISOString().slice(0, 10)}.csv`, csv);
};