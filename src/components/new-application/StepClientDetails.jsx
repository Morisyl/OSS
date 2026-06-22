'use client';

import { useEffect, useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { supabase } from '../../lib/supabase';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { DynamicFormRender } from '../common/DynamicFormRender';

const ClientRow = ({ client, index, onChange, onLookup, dynamicFields }) => {
  const helperMessage = client.isNewClient === false
    ? '✅ Existing client found.'
    : client.isNewClient === true
      ? '✨ New client will be created.'
      : '';

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-3">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Client {index + 1}</div>
      <Input
        label="Client ID / Passport No."
        placeholder="Enter ID"
        value={client.clientId}
        onChange={(e) => onChange(index, 'clientId', e.target.value)}
        onBlur={() => onLookup(index)}
        helperText={helperMessage}
      />
      <div className="flex gap-3">
        <Input
          label="Name"
          placeholder="Full name"
          value={client.clientName}
          onChange={(e) => onChange(index, 'clientName', e.target.value)}
          disabled={client.isNewClient === false}
          className="flex-1"
        />
        <Input
          label="Phone No."
          placeholder="0712345678"
          value={client.phone}
          onChange={(e) => onChange(index, 'phone', e.target.value)}
          disabled={client.isNewClient === false}
          className="flex-1"
        />
      </div>

      {/* Dynamic fields for this client */}
      {dynamicFields.length > 0 && (
        <DynamicFormRender
          fields={dynamicFields}
          formData={client.dynamicData || {}}
          onChange={(updated) => onChange(index, 'dynamicData', updated)}
        />
      )}
    </div>
  );
};

export const StepClientDetails = ({ data, updateData }) => {
  const { lookupClientId } = useClients();
  const [dynamicFields, setDynamicFields] = useState([]);

  useEffect(() => {
    supabase
      .from('form_fields')
      .select('*')
      .eq('target_entity', 'client')
      .order('sort_order')
      .then(({ data: d }) => { if (d) setDynamicFields(d); });
  }, []);

  const handleChange = (index, field, value) => {
    const updated = data.clients.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateData({ clients: updated });
  };

  const handleLookup = async (index) => {
    const client = data.clients[index];
    if (!client.clientId?.trim()) return;
    const found = await lookupClientId(client.clientId.trim());
    const updated = data.clients.map((c, i) =>
      i === index
        ? found
          ? { ...c, clientName: found.name || '', phone: found.phone_number || '', isNewClient: false, dynamicData: found.dynamic_data || {} }
          : { ...c, isNewClient: true }
        : c
    );
    updateData({ clients: updated });
  };

  const addRow = () => {
    updateData({
      clients: [...data.clients, { clientId: '', clientName: '', phone: '', isNewClient: null, dynamicData: {} }]
    });
  };

  return (
    <div className="space-y-4 animate-scale-in">
      {data.clients.map((client, index) => (
        <ClientRow
          key={index}
          client={client}
          index={index}
          onChange={handleChange}
          onLookup={handleLookup}
          dynamicFields={dynamicFields}
        />
      ))}
      <Button variant="secondary" onClick={addRow} className="w-full">
        + Add Client
      </Button>
    </div>
  );
};