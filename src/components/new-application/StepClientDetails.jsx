import { useEffect } from 'react';
import { useClients } from '../../hooks/useClients';
import { Input } from '../common/Input';

export const StepClientDetails = ({ data, updateData }) => {
  const { lookupClientId, loading } = useClients();

  // Debounced ID lookup
  useEffect(() => {
    const checkId = async () => {
      if (data.clientId && data.clientId.trim().length > 0) {
        const client = await lookupClientId(data.clientId.trim());
        if (client) {
          // FIX: Updated to client.phone_number to match the database schema
          // Added || '' to absolutely prevent the uncontrolled input error
          updateData({ 
            clientName: client.name || '', 
            phone: client.phone_number || '', 
            isNewClient: false 
          });
        } else {
          // Clear pre-fills if not found, mark as new
          updateData({ isNewClient: true });
        }
      } else {
        updateData({ isNewClient: null });
      }
    };
    
    const timeoutId = setTimeout(checkId, 500);
    return () => clearTimeout(timeoutId);
  }, [data.clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const helperMessage = loading 
    ? "Searching for existing Client ID..." 
    : data.isNewClient === false 
      ? "✅ Existing client found." 
      : data.isNewClient === true 
        ? "✨ New client will be created." 
        : "";

  return (
    <div className="space-y-6 animate-scale-in">
      <Input
        label="Client ID"
        placeholder="Enter Client ID"
        value={data.clientId}
        onChange={(e) => updateData({ clientId: e.target.value })}
        helperText={helperMessage}
      />
      
      <div className="flex gap-4">
        <Input
          label="Client Name"
          placeholder="Enter full name"
          value={data.clientName}
          onChange={(e) => updateData({ clientName: e.target.value })}
          disabled={data.isNewClient === false}
          className="flex-1"
        />
        <Input
          label="Phone Number"
          placeholder="e.g. 0712345678"
          value={data.phone}
          onChange={(e) => updateData({ phone: e.target.value })}
          disabled={data.isNewClient === false}
          className="flex-1"
        />
      </div>
    </div>
  );
};