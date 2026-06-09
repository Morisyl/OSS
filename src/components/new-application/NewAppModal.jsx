import { useState, useEffect } from 'react';
import { useClients } from '../../hooks/useClients';
import { createTransaction, updateTransaction } from '../../services/transactions.service';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StepProgress } from './StepProgress';
import { StepClientDetails } from './StepClientDetails';
import { StepPackagePicker } from './StepPackagePicker';
import { StepTransactionDetails } from './StepTransactionDetails';
import { isValidPhone } from '../../utils/validators';

const getDefaultData = () => ({
  clientId: '', 
  clientName: '',
  phone: '',
  isNewClient: null,
  packageId: null,
  packagePrice: 0,
  companyName: '',
  paidAmount: '',
  paymentStatus: 'Unpaid',
  comments: ''
});

export const NewAppModal = ({ isOpen, onClose, initialData = null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(getDefaultData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { createNewClient } = useClients();

  // If initialData is passed (Edit Mode), prefill the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        clientId: initialData.clients?.id || '',
        clientName: initialData.clients?.name || '',
        phone: initialData.clients?.phone_number || '',
        isNewClient: false,
        packageId: initialData.package_id,
        packagePrice: initialData.packages?.price || 0,
        companyName: initialData.company_name || '',
        paidAmount: initialData.paid_amount.toString(),
        paymentStatus: initialData.payment_status,
        comments: initialData.comments || ''
      });
    } else {
      setFormData(getDefaultData());
      setStep(1);
    }
  }, [initialData, isOpen]);

  const updateData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.clientId.trim()) return setError("Client ID is required.");
      if (!formData.clientName.trim()) return setError("Client name is required.");
      if (!isValidPhone(formData.phone)) return setError("Please enter a valid phone number.");
    }
    if (step === 2) {
      if (!formData.packageId) return setError("Please select a package.");
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.companyName.trim()) return setError("Company name is required.");
    
    setIsSubmitting(true);
    setError(null);

    try {
      let finalClientId = formData.clientId;

      // Create client if new
      if (formData.isNewClient) {
        const newClient = await createNewClient({ 
          id: formData.clientId.trim(), 
          name: formData.clientName.trim(), 
          phone_number: formData.phone.trim() 
        });
        finalClientId = newClient.id;
      }

      const payload = {
        client_id: finalClientId,
        package_id: formData.packageId,
        company_name: formData.companyName.trim(),
        paid_amount: Number(formData.paidAmount) || 0,
        payment_status: formData.paymentStatus,
        comments: formData.comments.trim()
      };

      if (initialData) {
        // EDIT MODE
        await updateTransaction(initialData.id, payload);
      } else {
        // NEW CREATION MODE
        payload.progress_status = 'Pending';
        await createTransaction(payload);
      }

      onClose();
    } catch (err) {
      console.error("SUPABASE SUBMIT ERROR:", err); 
      setError(err.message || "Failed to save to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title={initialData ? "Edit Application" : "New Application"} onClose={handleBack}>
      <StepProgress currentStep={step} totalSteps={3} />
      
      {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

      <div className="mb-8 min-h-[300px]">
        {step === 1 && <StepClientDetails data={formData} updateData={updateData} />}
        {step === 2 && <StepPackagePicker selectedPackageId={formData.packageId} updateData={updateData} />}
        {step === 3 && <StepTransactionDetails data={formData} updateData={updateData} />}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
        <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNext}>Next Step</Button>
        ) : (
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {initialData ? "Save Changes" : "Complete Application"}
          </Button>
        )}
      </div>
    </Modal>
  );
};