import { useState, useEffect } from 'react';
import { useServices } from '../../hooks/useServices';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';

export const PackageForm = ({ initialData, onSave, onCancel }) => {
  const { services, loading: loadingServices } = useServices();
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill selected services if editing
  useEffect(() => {
    if (initialData?.package_services) {
      setSelectedServiceIds(initialData.package_services.map(ps => ps.services.id));
    }
  }, [initialData]);

  const toggleService = (id) => {
    setSelectedServiceIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || selectedServiceIds.length === 0) {
      setError("Name, price, and at least one service are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let packageId = initialData?.id;

      // 1. Upsert the Package record
      if (packageId) {
        const { error: pkgErr } = await supabase.from('packages').update({ name, price: Number(price) }).eq('id', packageId);
        if (pkgErr) throw pkgErr;
      } else {
        const { data: newPkg, error: pkgErr } = await supabase.from('packages').insert([{ name, price: Number(price) }]).select().single();
        if (pkgErr) throw pkgErr;
        packageId = newPkg.id;
      }

      // 2. Sync the bridge table (package_services)
      // Delete existing relationships first if editing
      if (initialData?.id) {
        await supabase.from('package_services').delete().eq('package_id', packageId);
      }
      
      // Insert new relationships
      const bridgeData = selectedServiceIds.map(sId => ({ package_id: packageId, service_id: sId }));
      const { error: bridgeErr } = await supabase.from('package_services').insert(bridgeData);
      if (bridgeErr) throw bridgeErr;

      onSave(); // Trigger UI refresh in parent
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingServices) return <div className="py-8 text-center"><Spinner color="text-black dark:text-white" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
      
      <div className="flex gap-4">
        <Input label="Enter Package Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
        <Input label="Price (KES)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-1/3" />
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">Add Services (Select Multiple)</label>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl max-h-64 overflow-y-auto space-y-2 border border-gray-100 dark:border-gray-700">
          {services.map(service => (
            <label key={service.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl cursor-pointer hover:border-black dark:hover:border-white border border-transparent transition-all">
              <input 
                type="checkbox" 
                checked={selectedServiceIds.includes(service.id)}
                onChange={() => toggleService(service.id)}
                className="w-5 h-5 accent-black dark:accent-white"
              />
              <span className="font-medium text-black dark:text-white">{service.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Back</Button>
        <Button type="submit" loading={isSaving}>Save Package</Button>
      </div>
    </form>
  );
};