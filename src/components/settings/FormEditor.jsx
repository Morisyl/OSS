"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const FormEditor = ({ targetEntity = 'company' }) => {
  // Toggle for Compact vs Expanded view
  const [isEditing, setIsEditing] = useState(false);

  const [fields, setFields] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newField, setNewField] = useState({ type: 'text', label: '', isRequired: false, options: '' });
  const [newDocName, setNewDocName] = useState('');

  const [newDocFileTypes, setNewDocFileTypes] = useState('any');

  const fetchData = async () => {
    setLoading(true);
    const { data: fieldsData } = await supabase.from('form_fields').select('*').eq('target_entity', targetEntity).order('created_at');
    const { data: docsData } = await supabase.from('document_requirements').select('*').eq('target_entity', targetEntity).order('created_at');
    if (fieldsData) setFields(fieldsData);
    if (docsData) setDocs(docsData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [targetEntity]);

  const handleSaveField = async () => {
    if (!newField.label) return;
    const fieldKey = newField.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const optionsArray = newField.type === 'dropdown' ? newField.options.split(',').map(s => s.trim()).filter(s => s) : null;

    const { error } = await supabase.from('form_fields').insert([{
      target_entity: targetEntity, field_label: newField.label, field_key: fieldKey, field_type: newField.type, options: optionsArray, is_required: newField.isRequired
    }]);

    if (!error) {
      setIsFieldModalOpen(false);
      setNewField({ type: 'text', label: '', isRequired: false, options: '' });
      fetchData();
    }
  };

  const handleSaveDoc = async () => {
    if (!newDocName) return;
    const { error } = await supabase.from('document_requirements').insert([{
      target_entity: targetEntity,
      document_name: newDocName,
      accepted_file_types: newDocFileTypes,
      is_required: false
    }]);
    if (!error) { setNewDocName(''); setNewDocFileTypes('any'); fetchData(); }
  };


  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Delete this field?')) return;
    await supabase.from('form_fields').delete().eq('id', fieldId);
    fetchData();
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document requirement?')) return;
    await supabase.from('document_requirements').delete().eq('id', docId);
    fetchData();
  };


  const openFieldModal = (type) => { setNewField({ ...newField, type }); setIsFieldModalOpen(true); };

  if (loading) return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] h-24 w-full"></div>;

  // ==========================================
  // COLLAPSED STATE (Matches your wireframe)
  // ==========================================
  if (!isEditing) {
    return (
      <div className="bg-[#f0f0f0] dark:bg-gray-800 rounded-[2.5rem] p-8 flex justify-between items-center transition-all duration-300">
        <h2 className="text-2xl font-normal text-black dark:text-white uppercase tracking-wide">
          {targetEntity} DETAILS
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-[#1a73e8] hover:bg-blue-600 text-white text-lg font-medium py-2 px-10 rounded-full shadow-sm transition-colors"
        >
          EDIT
        </button>
      </div>
    );
  }

  // ==========================================
  // EXPANDED STATE (The Builder View)
  // ==========================================
  return (
    <div className="bg-[#f0f0f0] dark:bg-gray-800 rounded-[2.5rem] p-8 lg:p-12 space-y-10 transition-all duration-300 animate-fade-in shadow-sm">
      
      {/* Header with Close Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-normal text-black dark:text-white uppercase tracking-wide">
          {targetEntity} DETAILS
        </h2>
        <button 
          onClick={() => setIsEditing(false)}
          className="text-gray-500 hover:text-black dark:hover:text-white font-bold text-sm tracking-wider uppercase transition-colors"
        >
          Close Editor
        </button>
      </div>

      {/* Existing Fields styled like white pills */}
      <div className="space-y-4">
        {fields.length === 0 && <p className="text-gray-400 italic px-4">No custom details configured yet.</p>}
        {fields.map(field => (
          <div key={field.id} className="bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl font-medium text-lg flex justify-between items-center shadow-sm">
            <span className="text-black dark:text-white">{field.field_label}</span>
            <div className="flex items-center gap-3">
              {field.is_required && <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Required</span>}
              <button
                onClick={() => handleDeleteField(field.id)}
                className="bg-[#e31837] text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Black Buttons for New Fields */}
      <div>
        <p className="text-sm font-semibold mb-4 text-black dark:text-white">Create new details to collect</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => openFieldModal('text')} className="bg-black text-white text-lg py-4 rounded-md hover:bg-gray-800 transition-colors">Text Box</button>
          <button onClick={() => openFieldModal('dropdown')} className="bg-black text-white text-lg py-4 rounded-md hover:bg-gray-800 transition-colors">Option Menu</button>
          <button onClick={() => openFieldModal('date')} className="bg-black text-white text-lg py-4 rounded-md hover:bg-gray-800 transition-colors">Date</button>
        </div>
      </div>

      <hr className="border-gray-300 dark:border-gray-700" />

      {/* Document Upload Area */}
      <div className="space-y-6">
        <h3 className="text-xl font-normal text-black dark:text-white">upload doc detail</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder="e.g. Doc Name" 
              value={newDocName} 
              onChange={(e) => setNewDocName(e.target.value)} 
            />
          </div>

          {/* file type input in the doc upload form */}
          <select
            value={newDocFileTypes}
            onChange={(e) => setNewDocFileTypes(e.target.value)}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-black dark:text-white border-transparent"
          >
            <option value="any">Any file type</option>
            <option value=".pdf">PDF only</option>
            <option value=".pdf,.jpg,.png">PDF / Image</option>
            <option value=".jpg,.jpeg,.png">Images only</option>
            <option value=".docx,.doc">Word Documents</option>
          </select>


          <button onClick={handleSaveDoc} className="px-8 bg-[#1a73e8] hover:bg-blue-600 text-white rounded-xl font-medium transition-colors">
            ADD
          </button>
        </div>

        {/* Existing Docs */}
        <div className="space-y-3 mt-6">
          {docs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl flex justify-between items-center shadow-sm">
              <div>
                <span className="font-medium text-lg text-black dark:text-white">{doc.document_name}</span>
                {doc.accepted_file_types && doc.accepted_file_types !== 'any' && (
                  <span className="ml-3 text-xs text-gray-400">({doc.accepted_file_types})</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="bg-[#e31837] text-white font-medium px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Creation Modal */}
      <Modal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} title={`ADD NEW ${newField.type.toUpperCase()}`}>
        <div className="space-y-6">
          <Input label="Data Name (Display Label)" placeholder="e.g. KRA PIN" value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} />
          {newField.type === 'dropdown' && (
             <Input label="Options (Comma separated)" placeholder="e.g. Technology, Healthcare, Finance" value={newField.options} onChange={(e) => setNewField({...newField, options: e.target.value})} />
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={newField.isRequired} onChange={(e) => setNewField({...newField, isRequired: e.target.checked})} className="w-5 h-5 accent-[#1a73e8]" />
            <span className="font-medium">Is this field required?</span>
          </label>
          <Button onClick={handleSaveField} className="w-full mt-4 bg-[#1a73e8] hover:bg-blue-600 border-none">SAVE FIELD</Button>
        </div>
      </Modal>

    </div>
  );
};