import { usePackages } from '../../hooks/usePackages';
import { formatCurrency } from '../../utils/formatters';
import { Spinner } from '../common/Spinner';

export const StepPackagePicker = ({ selectedPackageId, updateData }) => {
  const { packages, loading, error } = usePackages();

  if (loading) return <div className="py-12 flex justify-center"><Spinner className="w-8 h-8 text-black dark:text-white" /></div>;
  if (error) return <div className="text-red-500 font-medium">{error}</div>;

  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 animate-scale-in">
      {packages.map((pkg) => (
        <label 
          key={pkg.id} 
          className={`
            block p-5 rounded-3xl border-2 cursor-pointer transition-all duration-200
            ${selectedPackageId === pkg.id 
              ? 'border-black bg-gray-50 dark:border-white dark:bg-gray-800' 
              : 'border-transparent bg-gray-100 hover:border-gray-300 dark:bg-gray-900 dark:hover:border-gray-700'
            }
          `}
        >
          <div className="flex items-center gap-4">
            <input 
              type="radio" 
              name="package" 
              value={pkg.id} 
              checked={selectedPackageId === pkg.id}
              onChange={() => updateData({ packageId: pkg.id, packagePrice: pkg.price })}
              className="w-5 h-5 accent-black dark:accent-white"
            />
            <div className="flex-1">
              <div className="font-bold text-lg text-black dark:text-white">{pkg.name}</div>
              <div className="text-sm font-medium text-gray-500">{pkg.package_services?.length || 0} services included</div>
            </div>
            <div className="font-bold text-xl text-black dark:text-white">
              {formatCurrency(pkg.price)}
            </div>
          </div>
        </label>
      ))}
      {packages.length === 0 && (
        <p className="text-gray-500 italic text-center py-8">No packages available. Please configure them in Settings.</p>
      )}
    </div>
  );
};