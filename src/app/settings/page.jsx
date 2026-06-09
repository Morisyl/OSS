"use client";

import { ServiceManager } from '../../components/settings/ServiceManager';
import { PackageManager } from '../../components/settings/PackageManager';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-scale-in pb-12">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight uppercase text-black dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Manage your service catalogue and package bundles.
        </p>
      </div>

      {/* Side-by-Side Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ServiceManager />
        <PackageManager />
      </div>

    </div>
  );
}