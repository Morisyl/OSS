export const FilterBar = ({ filterFields, selectedField, onFieldChange, selectedValue, onValueChange }) => {
  const activeField = filterFields.find(f => f.uid === selectedField);

  return (
    <div className="flex items-center gap-3 mb-6">
      <select
        value={selectedField}
        onChange={(e) => { onFieldChange(e.target.value); onValueChange(''); }}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-black dark:text-white"
      >
        <option value="">Filter by...</option>
        {filterFields.map(f => (
          <option key={f.uid} value={f.uid}>{f.label}</option>
        ))}
      </select>

      {activeField && (
        <select
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-black dark:text-white"
        >
          <option value="">Any</option>
          {activeField.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {(selectedField || selectedValue) && (
        <button
          onClick={() => { onFieldChange(''); onValueChange(''); }}
          className="text-xs font-bold text-gray-400 hover:text-red-500"
        >
          Clear filter
        </button>
      )}
    </div>
  );
};