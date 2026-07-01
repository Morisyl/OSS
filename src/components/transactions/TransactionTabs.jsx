export const TransactionTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 text-lg font-bold whitespace-nowrap transition-all border-b-2 -mb-px ${
            activeTab === tab.id
              ? 'text-white dark:text-white border-white dark:border-white'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};