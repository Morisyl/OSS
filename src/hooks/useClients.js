import { useState } from 'react';
import { getClientById, searchClients, createClient } from '../services/clients.service';

export const useClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookupClientId = async (id) => {
    try {
      setLoading(true);
      setError(null);
      return await getClientById(id);
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createNewClient = async (clientData) => {
    try {
      setLoading(true);
      setError(null);
      return await createClient(clientData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { lookupClientId, createNewClient, loading, error };
};