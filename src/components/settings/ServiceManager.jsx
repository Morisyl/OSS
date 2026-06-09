import { useState } from 'react';
import { useServices } from '../../hooks/useServices';
import { createService, deleteService } from '../../services/services.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';

export const ServiceManager = () => {
  const { services, loading, error, refetchServices } = useServices();
  const [newServiceName, setNewServiceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    
    setIsSubmitting(true);
    setActionError(null);
    try {
      await createService({ name: newServiceName.trim() });
      setNewServiceName('');
      await refetchServices();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      await refetchServices();
    } catch (err) {
      // Graceful error handling for foreign key constraints
      setActionError("Cannot delete a service that is part of an existing package or active transaction.");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="w-8 h-8 text-black dark:text-white" /></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-4xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6 uppercase tracking-tight">Services Catalogue</h2>
      
      {actionError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{actionError}</div>}

      <form onSubmit={handleAddService} className="flex gap-4 mb-8 items-end">
        <div className="flex-1">
          <Input 
            label="Add New Service"
            placeholder="e.g. Logo Design, ETIMS Registration..." 
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
          />
        </div>
        <Button type="submit" loading={isSubmitting} disabled={!newServiceName.trim()}>
          Add
        </Button>
      </form>

      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-gray-500 italic">No services created yet.</p>
        ) : (
          services.map(service => (
            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <span className="font-medium text-black dark:text-white">{service.name}</span>
              <Button variant="danger" onClick={() => handleDelete(service.id)} className="px-4 py-1.5 text-sm">
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};