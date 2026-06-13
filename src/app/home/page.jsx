"use client";

import { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { TransactionList } from '../../components/transactions/TransactionList';
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

  // Debounced search hook built in Phase 6
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery);

  return (
    <>
    <div className="max-w-5xl mx-auto h-full flex flex-col relative animate-scale-in">
      
      {/* Header & Search Block */}
      <div className="mb-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-black dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Manage active transactions and incoming client applications.
            </p>
          </div>
          <Button onClick={() => setIsNewAppOpen(true)}>
            New Application
          </Button>
        </div>

        <div className="relative">
          <Input 
            placeholder="Search by Company or Client ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner className="w-5 h-5" color="text-black dark:text-white" />
            </div>
          )}
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
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">
              Active Transactions
            </h3>
            <TransactionList onSelectTransaction={setSelectedTransactionId} />
          </div>
        )}
      </div>
    </div>

    {isNewAppOpen && (
      <NewAppModal isOpen={isNewAppOpen} onClose={() => setIsNewAppOpen(false)} />
    )}
    {selectedTransactionId && (
      <TransactionDetail transactionId={selectedTransactionId} onClose={() => setSelectedTransactionId(null)} />
    )}    

    </>
  );
}