"use client";

import { useState } from 'react';
import { ServiceManager } from '../../components/settings/ServiceManager';
import { PackageManager } from '../../components/settings/PackageManager';
import { PackageForm } from '../../components/settings/PackageForm';
import { Modal } from '../../components/common/Modal';
import { deletePackage } from '../../services/packages.service';

export default function SettingsPage() {
  const [editingPackage, setEditingPackage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await deletePackage(id);
      setEditingPackage(null);
      setRefreshKey(k => k + 1); // triggers PackageManager refetch
    } catch {
      alert("Cannot delete a package with active transactions.");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto animate-scale-in pb-12 space-y-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight uppercase text-black dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage your service catalogue and package bundles.
          </p>
        </div>

        <PackageManager key={refreshKey} onEdit={setEditingPackage} />
        <ServiceManager />
      </div>

      {/* Modal lives outside the constrained div so fixed positioning works */}
      <Modal
        isOpen={editingPackage !== null}
        title={editingPackage?.id ? "Edit Package" : "New Package"}
        onClose={() => setEditingPackage(null)}
      >
        <PackageForm
          initialData={editingPackage}
          onSave={() => { setEditingPackage(null); setRefreshKey(k => k + 1); }}
          onCancel={() => setEditingPackage(null)}
          onDelete={handleDelete}
        />
      </Modal>
    </>
  );
}