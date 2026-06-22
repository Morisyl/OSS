import { useState, useEffect } from 'react';
import { useTransaction } from '../../hooks/useTransaction';
import { updateTransactionStatus, updateTransaction } from '../../services/transactions.service';
import { updateTaskStatus } from '../../services/transaction-services.service';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { NewAppModal } from '../new-application/NewAppModal';
import { DynamicFormRender } from '../common/DynamicFormRender';
import { supabase } from '../../lib/supabase'

export const TransactionDetail = ({ transactionId, onClose }) => {
  const { transaction, tasks, loading, error } = useTransaction(transactionId);
  const [view, setView] = useState('details'); 
  const [localTasks, setLocalTasks] = useState([]);
  const [localComment, setLocalComment] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [companyFields, setCompanyFields] = useState([]);

  useEffect(() => {
    if (tasks) setLocalTasks(tasks);
    if (transaction) setLocalComment(transaction.comments || '');
  }, [tasks, transaction]);

  // Fetch dynamic company fields
  useEffect(() => {  
    supabase.from('form_fields').select('*').eq('target_entity', 'company').order('sort_order')
      .then(({ data: d }) => { if (d) setCompanyFields(d); });
  }, []);

  // Auto-complete transaction if all tasks are done
  useEffect(() => {
    if (localTasks.length > 0 && transaction?.progress_status !== 'Complete') {
      const allDone = localTasks.every(t => t.task_status === 'Done');
      if (allDone) handleMarkTransactionComplete();
    }
  }, [localTasks]);
  // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkTransactionComplete = async () => {
    try {
      await updateTransactionStatus(transactionId, { progress_status: 'Complete' });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    
    // Optimistic UI update
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, task_status: newStatus } : t
    ));

    // Database update
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to toggle task", err);
      setLocalTasks(tasks); // Revert on fail
    }
  };

  const handleCommentSave = async () => {
    if (localComment === transaction.comments) return; // No changes made
    
    setIsSavingComment(true);
    try {
      await updateTransaction(transactionId, { comments: localComment.trim() });
    } catch (err) {
      console.error("Failed to save comment", err);
    } finally {
      setIsSavingComment(false);
    }
  };

  if (loading && !transaction) return <Modal isOpen={true} onClose={onClose}><div className="py-20 text-center">Loading...</div></Modal>;
  if (error || !transaction) return null;

  // Render the Edit Mode (Reuses the New Application form)
  if (view === 'edit') {
    const transactionWithTasks = {
      ...transaction,
      transaction_services: localTasks  // inject the already-loaded tasks
    };
    return <NewAppModal isOpen={true} initialData={transactionWithTasks} onClose={() => setView('details')} />;
  }

  // Split tasks for rendering
  const packageTasks = localTasks.filter(t => !t.is_additional);
  const additionalTasks = localTasks.filter(t => t.is_additional);

  return (
    <Modal isOpen={true} title="" onClose={onClose}>
      
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar">
        
        {/* Header Area */}
        <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="flex-1 pr-6">
            <h1 className="text-3xl lg:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
              {transaction.company_name}
            </h1>
            {companyFields.length > 0 && transaction.company_dynamic_data && (
              <div className="mt-4">
                <DynamicFormRender
                  fields={companyFields}
                  formData={transaction.company_dynamic_data}
                  onChange={() => {}} // read-only
                />
              </div>
            )}
          </div>
          <Button onClick={() => setView('edit')} className="bg-[#2a2656] hover:bg-[#1f1c40] text-white px-8 shrink-0">
            Edit
          </Button>
        </div>

        {/* Read-Only Client Details */}
        <section>
          <h3 className="text-sm font-semibold text-black dark:text-white mb-4">Client details</h3>
          <div className="space-y-3">
            {transaction.transaction_clients?.map(tc => (
              <div key={tc.clients.id} className="grid grid-cols-3 gap-4">
                <div className="px-4 py-3 bg-gray-200 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tc.clients.id}
                </div>
                <div className="px-4 py-3 bg-gray-200 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tc.clients.name}
                </div>
                <div className="px-4 py-3 bg-gray-200 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tc.clients.phone_number}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services & Progress Checklist */}
        <section>
          <h3 className="text-sm font-semibold text-black dark:text-white mb-4">Services ({transaction.packages?.name})</h3>
          <div className="bg-gray-50 dark:bg-[#0b1120] p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="grid gap-3">
              {packageTasks.map(task => {
                const isDone = task.task_status === 'Done';
                return (
                  <label key={task.id} className="flex items-center gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleTaskToggle(task.id, task.task_status)}
                      className="w-5 h-5 accent-[#2a2656] cursor-pointer"
                    />
                    <span className={`font-medium text-lg transition-all ${isDone ? 'line-through text-gray-400' : 'text-black dark:text-white group-hover:text-[#2a2656]'}`}>
                      {task.services?.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        {/* Conditional Additional Services Grid (4,x) */}
        {additionalTasks.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-black dark:text-white mb-4">Additional services</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {additionalTasks.map(task => {
                const isDone = task.task_status === 'Done';
                return (
                  <label
                    key={task.id}
                    className={`flex items-center justify-center p-4 rounded-md cursor-pointer text-sm font-medium text-center transition-all ${
                      isDone
                        ? 'bg-[#2a2656] text-white ring-2 ring-[#2a2656]'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isDone}
                      onChange={() => handleTaskToggle(task.id, task.task_status)}
                    />
                    {task.services?.name}
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* Editable Comments Area */}
        <section>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-semibold text-black dark:text-white">Comments</label>
            {isSavingComment && <span className="text-xs text-gray-400 font-bold animate-pulse">Saving...</span>}
          </div>
          <textarea
            rows={5}
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            onBlur={handleCommentSave} // Saves to database when user clicks out
            className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 border-transparent rounded-md text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-[#2a2656] text-black dark:text-white"
          />
        </section>

        {/* Read-Only Paid Toggle */}
        <section>
          <label className="mb-4 block text-lg font-medium text-black dark:text-white">Paid?</label>
          <div className="grid grid-cols-2 gap-4 opacity-70 pointer-events-none">
            {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
              <div
                key={String(opt.value)}
                className={`flex items-center justify-center p-4 rounded-md transition-all relative ${
                  transaction.is_paid === opt.value
                    ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-gray-400'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
              >
                <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${transaction.is_paid === opt.value ? 'border-black dark:border-white bg-black dark:bg-white' : 'border-gray-400'}`} />
                <span className="font-medium text-lg text-black dark:text-white">{opt.label}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Fixed Footer Control */}
      <div className="p-6 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 flex justify-center">
        <Button 
          onClick={onClose} 
          className="bg-red-700 hover:bg-red-800 text-white text-lg font-bold w-48 py-3 rounded-xl shadow-lg transition-all"
        >
          CLOSE
        </Button>
      </div>
      
    </Modal>
  );
};