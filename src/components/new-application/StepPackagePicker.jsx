import { useState } from 'react';
import { usePackages } from '../../hooks/usePackages';
import { useServices } from '../../hooks/useServices';
import { formatCurrency } from '../../utils/formatters';
import { Spinner } from '../common/Spinner';

export const StepPackagePicker = ({ data, updateData }) => {
  const { packages, loading: loadingPkg } = usePackages();
  const { services, loading: loadingSvc } = useServices();
  const [expandedPkg, setExpandedPkg] = useState(null); // pkg.id or null

  if (loadingPkg || loadingSvc) return (
    <div className="py-12 flex justify-center">
      <Spinner className="w-8 h-8 text-black dark:text-white" />
    </div>
  );

  const selectedPkg = packages.find(p => p.id === data.packageId);
  const packageServiceIds = selectedPkg?.package_services?.map(ps => ps.services.id) || [];

  // Services NOT in the selected package
  const additionalPool = packageServiceIds.length
    ? services.filter(s => !packageServiceIds.includes(s.id))
    : services;

  const toggleAdditional = (id) => {
    const current = data.additionalServiceIds || [];
    const updated = current.includes(id)
      ? current.filter(s => s !== id)
      : [...current, id];
    updateData({ additionalServiceIds: updated });
  };

  const handlePackageClick = (pkg) => {
    if (data.packageId === pkg.id) {
      // Second click — toggle the services dropdown
      setExpandedPkg(prev => prev === pkg.id ? null : pkg.id);
    } else {
      updateData({ packageId: pkg.id, packagePrice: pkg.price, additionalServiceIds: [] });
      setExpandedPkg(null);
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Package tiles */}
      <div className="space-y-3">
        {packages.map(pkg => (
          <div key={pkg.id}>
            <div
              onClick={() => handlePackageClick(pkg)}
              className={`
                p-5 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
                ${data.packageId === pkg.id
                  ? 'border-black bg-gray-50 dark:border-white dark:bg-gray-800'
                  : 'border-transparent bg-gray-100 hover:border-gray-300 dark:bg-gray-900'
                }
              `}
            >
              <input
                type="radio"
                name="package"
                readOnly
                checked={data.packageId === pkg.id}
                className="w-5 h-5 accent-black dark:accent-white"
              />
              <div className="flex-1">
                <div className="font-bold text-lg">{pkg.name}</div>
                <div className="text-sm text-gray-500">
                  {pkg.package_services?.length || 0} services included
                  {data.packageId === pkg.id && ' — click again to view'}
                </div>
              </div>
              <div className="font-bold text-xl">{formatCurrency(pkg.price)}</div>
            </div>

            {/* Services dropdown (shown on second click) */}
            {expandedPkg === pkg.id && (
              <div className="mt-1 ml-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Included services
                </div>
                {pkg.package_services?.map(ps => (
                  <div key={ps.services.id} className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block" />
                    {ps.services.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional services grid (4-column) */}
      {data.packageId && additionalPool.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 ml-1">
            Additional Services
          </div>
          <div className="grid grid-cols-4 gap-2">
            {additionalPool.map(service => {
              const checked = (data.additionalServiceIds || []).includes(service.id);
              return (
                <label
                  key={service.id}
                  className={`
                    p-3 rounded-2xl border-2 cursor-pointer text-xs font-semibold text-center transition-all
                    ${checked
                      ? 'border-black bg-gray-100 dark:border-white dark:bg-gray-800'
                      : 'border-transparent bg-gray-50 hover:border-gray-200 dark:bg-gray-900'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => toggleAdditional(service.id)}
                  />
                  {service.name}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};