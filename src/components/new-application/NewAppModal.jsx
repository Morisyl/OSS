'use client';

import { useState, useEffect } from 'react';
import { useClients } from '../../hooks/useClients';
import { createTransaction, updateTransaction } from '../../services/transactions.service';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StepClientDetails } from './StepClientDetails';
import { StepPackagePicker } from './StepPackagePicker';
import { StepCompanyDetails } from './StepCompanyDetails';
import { StepComments } from './StepComments';
import { supabase } from '../../lib/supabase';
import { DynamicFormRender } from '../common/DynamicFormRender';
import { isValidPhone } from '../../utils/validators';
import { ExpandableTile } from '../common/ExpandableTile';
import { ExtraEntitySection } from './ExtraEntitySection';



const getDefaultData = () => ({
  clients: [{ clientId: '', clientName: '', phone: '', isNewClient: null, dynamicData: {} }],
  companyName: '',
  companyDynamicData: {},
  customData: {},
  packageId: null,
  packagePrice: 0,
  additionalServiceIds: [],
  isPaid: false,
  comments: ''
});

export const NewAppModal = ({ isOpen, onClose, onSaved, initialData = null }) => {
  const [formData, setFormData] = useState(getDefaultData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { createNewClient } = useClients();
  const [extraEntities, setExtraEntities] = useState([]);

  useEffect(() => {
    supabase
      .from('form_fields')
      .select('target_entity')
      .not('target_entity', 'in', '(company,client)')
      .then(({ data }) => {
        const unique = [...new Set((data || []).map(f => f.target_entity))];
        setExtraEntities(unique);
      });
  }, []);

  // If initialData is passed (Edit Mode), prefill the form using the new schema
  useEffect(() => {
    if (initialData) {
      setFormData({
        // Map the new junction table data back into the form state
        clients: initialData.transaction_clients?.map(tc => ({
          clientId: tc.clients.id,
          clientName: tc.clients.name,
          phone: tc.clients.phone_number,
          isNewClient: false
        })) || [{ clientId: '', clientName: '', phone: '', isNewClient: null }],
        companyName: initialData.company_name || '',

        companyDynamicData: initialData.company_dynamic_data || {},
        // For clients, the lookup already hydrates dynamicData from found.dynamic_data (done in StepClientDetails)

        packageId: initialData.package_id,
        packagePrice: initialData.packages?.price || 0,
        // Map any existing additional services
        additionalServiceIds: initialData.transaction_services
          ?.filter(ts => ts.is_additional)
          .map(ts => ts.service_id) || [],
        isPaid: initialData.is_paid || false,
        customData: initialData.custom_data || {},
        comments: initialData.comments || ''
      });
    } else {
      setFormData(getDefaultData());
      setError(null);
    }
  }, [initialData, isOpen]);

  const updateData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleBack = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    // 1. Unified Validation
    if (!formData.companyName.trim()) {
      return setError("Company name is required.");
    }

    const anyInvalidClient = formData.clients.some(
      c => !c.clientId.trim() || !c.clientName.trim() || !isValidPhone(c.phone)
    );
    if (anyInvalidClient || formData.clients.length === 0) {
      return setError("All client rows require an ID, Name, and a valid Phone number.");
    }

    if (!formData.packageId && (!formData.additionalServiceIds || formData.additionalServiceIds.length === 0)) {
      return setError("Please select a package or at least one additional service.");
    }

    // 2. Submission logic
    setIsSubmitting(true);

    try {
      // Resolve / create all clients
      const clientIds = await Promise.all(
        formData.clients.map(async (c) => {
          if (c.isNewClient) {
            const newClient = await createNewClient({
              id: c.clientId.trim(),
              name: c.clientName.trim(),
              phone_number: c.phone.trim(),
              dynamic_data: c.dynamicData || {}
            });


            return newClient.id;
          }
          return c.clientId.trim();
        })
      );

      const payload = {
        clientIds,
        package_id: formData.packageId,
        company_name: formData.companyName.trim(),
        company_dynamic_data: formData.companyDynamicData,
        custom_data: formData.customData,
        is_paid: formData.isPaid,
        additionalServiceIds: formData.additionalServiceIds,
        comments: formData.comments.trim()
      };

      if (initialData) {
        await updateTransaction(initialData.id, payload);
      } else {
        payload.progress_status = 'Pending';
        await createTransaction(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title={initialData ? "Edit Application" : "New Application"} onClose={handleBack}>
      
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
          {error}
        </div>
      )}

      {/* Scrollable Form Body 
        Uses flex-1 to fill the remaining Modal height, and overflow-y-auto to create the SINGLE scrollbar.
      */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-12 custom-scrollbar">
        
        <ExpandableTile title="Company Details" defaultOpen={true}>
          <StepCompanyDetails data={formData} updateData={updateData} />
        </ExpandableTile>

        <ExpandableTile title="Client Details">
          <StepClientDetails data={formData} updateData={updateData} />
        </ExpandableTile>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">Services & Packages</h3>
          <StepPackagePicker data={formData} updateData={updateData} />
        </section>

        {extraEntities.map(entity => (
          <ExpandableTile key={entity} title={entity.replace(/_/g, ' ')}>
            <ExtraEntitySection
              entity={entity}
              formData={formData}
              updateData={updateData}
            />
          </ExpandableTile>
        ))}
        
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">Final Details</h3>
          <StepComments data={formData} updateData={updateData} />
        </section>

      </div>

      {/* Fixed Footer Controls */}
      <div className="flex justify-between items-center p-6 lg:p-8 bg-gray-50 dark:bg-[#0b1120] border-t border-gray-100 dark:border-gray-800">
        <Button variant="ghost" onClick={handleBack} disabled={isSubmitting} className="text-lg px-6 py-3">
          Cancel
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          loading={isSubmitting} 
          className="bg-red-700 hover:bg-red-800 text-white text-lg font-bold px-12 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          {initialData ? "Save Changes" : "Submit"}
        </Button>
      </div>
      
    </Modal>
  );
};
