import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { deletePackage } from '../../services/packages.service';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

export const PackageManager = ({ onEdit }) => {
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
      setEditingPackage(null); // Close the modal if deletion is successful
      fetchPackages();
    } catch (err) {
      setActionError("Cannot delete a package that has active transactions.");
    }
  };

  return (
    
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-black tracking-tight text-black dark:text-white">Packages</h2>
        <Button onClick={() => onEdit({})}>Add Package</Button>
      </div>

      {actionError && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{actionError}</div>}

      {loading ? (
        <div className="flex justify-center p-8"><Spinner className="w-8 h-8 text-black dark:text-white" /></div>
      ) : (
        <div className={packages.length === 0 ? "space-y-4" : "grid grid-cols-2 gap-4"}>
          {packages.length === 0 ? (
            <p className="text-gray-500 italic col-span-2">No packages configured.</p>
          ) : (
            packages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => onEdit(pkg)}
                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white transition-all flex flex-col justify-center min-h-30"
              >
                <div className="font-bold text-lg">{pkg.name}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">
                  {pkg.package_services?.length || 0} services • {formatCurrency(pkg.price)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      
    </div>

    
  );
};