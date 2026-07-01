'use client';

import { useState } from 'react';
import { FormEditor } from '../../../components/settings/FormEditor';
import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function FormBuilderPage() {
  // Seed with the two fixed entities; user can add more
  const [entities, setEntities] = useState(['company', 'client']);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');

  useEffect(() => {
    supabase
      .from('form_fields')
      .select('target_entity')
      .then(({ data }) => {
        const found = [...new Set((data || []).map(f => f.target_entity))];
        setEntities(prev => [...new Set([...prev, ...found])]);
      });
  }, []);

  const handleAddComponent = () => {
    const key = newEntityName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key || entities.includes(key)) return;
    setEntities(prev => [...prev, key]);
    setNewEntityName('');
    setIsAdding(false);
  };

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white">
          Data Blueprints
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Define what information to collect per entity type.
        </p>
      </div>

      <div className="space-y-6 animate-fade-in">
        {entities.map(entity => (
          <FormEditor key={entity} targetEntity={entity} />
        ))}
      </div>

      <div className="flex flex-col items-center mt-12 gap-4">
        {isAdding ? (
          <div className="flex gap-3 w-full max-w-sm">
            <input
              type="text"
              placeholder="e.g. Director Details"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComponent()}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white"
              autoFocus
            />
            <button
              onClick={handleAddComponent}
              className="bg-[#241c5c] hover:bg-[#1a1444] text-white font-medium py-3 px-6 rounded-sm shadow-md transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-black dark:hover:text-white font-medium py-3 px-4 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#241c5c] hover:bg-[#1a1444] text-white font-medium py-3 px-8 rounded-sm shadow-md transition-colors"
          >
            Add New Component
          </button>
        )}
      </div>
    </div>
  );
}