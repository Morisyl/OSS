import { useEffect } from 'react';
import { useClients } from '../../hooks/useClients';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const ClientRow = ({ client, index, onChange, onLookup }) => {
  const helperMessage = client.isNewClient === false
    ? "✅ Existing client found."
    : client.isNewClient === true
      ? "✨ New client will be created."
      : "";

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-3">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Client {index + 1}</div>
      <Input
        label="Client ID / Passport No."
        placeholder="Enter ID"
        value={client.clientId}
        onChange={(e) => onChange(index, 'clientId', e.target.value)}
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
    </div>
  );
};

export const StepClientDetails = ({ data, updateData }) => {
  const { lookupClientId } = useClients();

  const handleChange = (index, field, value) => {
    const updated = data.clients.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateData({ clients: updated });
  };

  // Debounced lookup per row
  useEffect(() => {
    const timers = data.clients.map((client, index) => {
      return setTimeout(async () => {
        if (client.clientId?.trim().length > 0) {
          const found = await lookupClientId(client.clientId.trim());
          const updated = data.clients.map((c, i) =>
            i === index
              ? found
                ? { ...c, clientName: found.name || '', phone: found.phone_number || '', isNewClient: false }
                : { ...c, isNewClient: true }
              : c
          );
          updateData({ clients: updated });
        }
      }, 500);
    });
    return () => timers.forEach(clearTimeout);
  }, [data.clients.map(c => c.clientId).join(',')]); // eslint-disable-line

  const addRow = () => {
    updateData({
      clients: [...data.clients, { clientId: '', clientName: '', phone: '', isNewClient: null }]
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
          onLookup={() => {}}
        />
      ))}
      <Button variant="secondary" onClick={addRow} className="w-full">
        + Add Client
      </Button>
    </div>
  );
};