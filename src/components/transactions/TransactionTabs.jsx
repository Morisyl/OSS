export const TransactionTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 border-b border-gray-800 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 text-lg sm:text-2xl font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
            activeTab === tab.id
              ? 'text-black dark:text-white border-black dark:border-white'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};