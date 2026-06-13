import { useState } from 'react';
import { useServices } from '../../hooks/useServices';
import { createService, deleteService } from '../../services/services.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';
import { supabase } from '../../lib/supabase';


const ServiceRow = ({ service, onDelete, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(service.name);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl gap-3">
      {editing ? (
        <input
          autoFocus
          className="flex-1 bg-white dark:bg-gray-900 px-3 py-1 rounded-xl font-medium outline-none ring-2 ring-black dark:ring-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={async () => {
            if (name.trim() && name !== service.name) await onRename(service.id, name.trim());
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
            if (e.key === 'Escape') { setName(service.name); setEditing(false); }
          }}
        />
      ) : (
        <span className="flex-1 font-medium text-black dark:text-white">{service.name}</span>
      )}
      <Button variant="secondary" onClick={() => setEditing(true)} className="px-4 py-1.5 text-sm">Edit</Button>
      <Button variant="danger" onClick={() => onDelete(service.id)} className="px-4 py-1.5 text-sm">Delete</Button>
    </div>
  );
};


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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-black tracking-tight text-black dark:text-white">Services</h2>
        <Button onClick={() => document.getElementById('new-service-input')?.focus()}>Add Service</Button>
      </div>
      <hr className="border-gray-200 dark:border-gray-700 mb-6" />
      
      {actionError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{actionError}</div>}

      // UPDATE the form to remove the label and sit below the divider:
      <form onSubmit={handleAddService} className="flex gap-4 mb-6 items-center">
        <div className="flex-1">
          <Input
            id="new-service-input"
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
            <ServiceRow
              key={service.id}
              service={service}
              onDelete={handleDelete}
              onRename={async (id, newName) => {
                await supabase.from('services').update({ name: newName }).eq('id', id);
                await refetchServices();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};