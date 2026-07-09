"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useTransactions } from '../../hooks/useTransactions';
import { usePackages } from '../../hooks/usePackages';
import { TransactionList } from '../../components/transactions/TransactionList';
import { TransactionTabs } from '../../components/transactions/TransactionTabs';
import { FilterBar } from '../../components/transactions/FilterBar';
import { supabase } from '../../lib/supabase';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { TransactionDetail } from '../../components/transactions/TransactionDetail';
import { NewAppModal } from '../../components/new-application/NewAppModal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const { transactions, loading, error, refetch } = useTransactions();
  const { packages } = usePackages();
  // Debounced search hook built in Phase 6
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery);

  const tabs = useMemo(() => ([
    { id: 'active', label: 'Active' },
    ...packages.map(p => ({ id: p.id, label: p.name })),
    { id: 'completed', label: 'Completed' }
  ]), [packages]);


  const [filterFields, setFilterFields] = useState([]);
  const [selectedFilterField, setSelectedFilterField] = useState('');
  const [selectedFilterValue, setSelectedFilterValue] = useState('');

  useEffect(() => {
    supabase.from('form_fields').select('*').eq('field_type', 'dropdown').order('field_label')
      .then(({ data }) => {
        const dynamicFields = (data || []).map(f => ({
          uid: `${f.target_entity}:${f.field_key}`,
          label: f.field_label,
          target_entity: f.target_entity,
          field_key: f.field_key,
          options: f.options || []
        }));
        setFilterFields([
          { uid: 'builtin:is_paid', label: 'Payment Status', target_entity: 'builtin', field_key: 'is_paid', options: ['Paid', 'Not Paid'] },
          ...dynamicFields
        ]);
      });
  }, []);

 const getFieldValue = (transaction, field) => {
   if (field.target_entity === 'builtin' && field.field_key === 'is_paid') {
     return transaction.is_paid ? 'Paid' : 'Not Paid';
   }
   if (field.target_entity === 'company') {
     return transaction.company_dynamic_data?.[field.field_key];
   }
   return transaction.custom_data?.[field.target_entity]?.[field.field_key];
 };

  const filteredTransactions = useMemo(() => {
    let result;
    if (activeTab === 'completed') {
      result = transactions.filter(t => t.progress_status === 'Complete');
    } else if (activeTab === 'active') {
      result = transactions.filter(t => t.progress_status !== 'Complete');
    } else {
      // package tab: active transactions on that package only
      result = transactions.filter(
        t => t.progress_status !== 'Complete' && t.package_id === activeTab
      );
    }

    if (selectedFilterField && selectedFilterValue) {
      const field = filterFields.find(f => f.uid === selectedFilterField);
      if (field) {
        result = result.filter(t => getFieldValue(t, field) === selectedFilterValue);
      }
    }

    return result;
  }, [transactions, activeTab, selectedFilterField, selectedFilterValue, filterFields]);

  

  return (
    <>
    <div className="max-w-5xl mx-auto h-full flex flex-col relative animate-scale-in">
      
      {/* Header & Search Block */}
      <div className="mb-8 space-y-6 pt-10 md:pt-2">
        <div className="flex justify-end">
          <Button onClick={() => setIsNewAppOpen(true)}>
            New Application
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
         <div className="hidden sm:block w-40" /> {/* balances FilterBar width so search stays centered */}
         <div className="relative w-full sm:max-w-md">
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchLoading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <Spinner className="w-5 h-5" color="text-blue-400" />
              </div>
            )}
          </div>
          <FilterBar
            filterFields={filterFields}
            selectedField={selectedFilterField}
            onFieldChange={setSelectedFilterField}
            selectedValue={selectedFilterValue}
            onValueChange={setSelectedFilterValue}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-12">
        {searchQuery.trim().length >= 2 ? (
          // Active Search View
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">
              Search Results
            </h3>
            {searchResults.length === 0 && !searchLoading ? (
              <div className="text-center py-12 text-gray-500 italic font-medium">
                No results found for "{searchQuery}"
              </div>
            ) : (
              searchResults.map(t => (
                <TransactionCard 
                  key={t.id} 
                  transaction={t} 
                  onClick={() => setSelectedTransactionId(t.id)} 
                />
              ))
            )}
          </div>
        ) : (
          // Default Active Transactions View
          <div className="space-y-4">
            <div className="flex justify-center">
              <TransactionTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>
            
            <TransactionList
             transactions={filteredTransactions}
             loading={loading}
             error={error}
             onSelectTransaction={setSelectedTransactionId}
           />
          </div>
        )}
      </div>
    </div>

    {isNewAppOpen && (
      <NewAppModal
       isOpen={isNewAppOpen}
       onClose={() => setIsNewAppOpen(false)}
       onSaved={refetch}
     />
    )}
    {selectedTransactionId && (
      <TransactionDetail
       transactionId={selectedTransactionId}
       onClose={() => setSelectedTransactionId(null)}
       onListRefetch={refetch}
     />
    )}    

    </>
  );
}