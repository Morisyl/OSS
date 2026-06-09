import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { deletePackage } from '../../services/packages.service';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { Modal } from '../common/Modal';
import { PackageForm } from './PackageForm';

export const PackageManager = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null); // null = list view, {} = new, {data} = edit
  const [actionError, setActionError] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('packages').select('*, package_services(services(*))').order('created_at', { ascending: false });
    if (!error) setPackages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      setActionError(null);
      await deletePackage(id);
      fetchPackages();
    } catch (err) {
      // Phase 9 Watch-out constraint executed here
      setActionError("Cannot delete a package that has active transactions.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-4xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Packages</h2>
        <Button onClick={() => setEditingPackage({})}>New Package</Button>
      </div>

      {actionError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{actionError}</div>}

      {loading ? (
        <div className="flex justify-center p-8"><Spinner className="w-8 h-8 text-black dark:text-white" /></div>
      ) : (
        <div className="space-y-4">
          {packages.length === 0 ? (
            <p className="text-gray-500 italic">No packages configured.</p>
          ) : (
            packages.map(pkg => (
              <div key={pkg.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                <div>
                  <div className="font-bold text-lg">{pkg.name}</div>
                  <div className="text-sm text-gray-500 font-medium">
                    {pkg.package_services?.length || 0} services • {formatCurrency(pkg.price)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setEditingPackage(pkg)} className="px-4 py-1.5 text-sm">Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(pkg.id)} className="px-4 py-1.5 text-sm">Delete</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Package Editor Modal overlay */}
      <Modal 
        isOpen={editingPackage !== null} 
        title={editingPackage?.id ? "Edit Package" : "New Package"}
        onClose={() => setEditingPackage(null)}
      >
        <PackageForm 
          initialData={editingPackage} 
          onSave={() => { setEditingPackage(null); fetchPackages(); }} 
          onCancel={() => setEditingPackage(null)} 
        />
      </Modal>
    </div>
  );
};