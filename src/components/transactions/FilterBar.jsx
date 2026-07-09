export const FilterBar = ({ filterFields, selectedField, onFieldChange, selectedValue, onValueChange }) => {
  const activeField = filterFields.find(f => f.uid === selectedField);

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
      <select
        value={selectedField}
        onChange={(e) => { onFieldChange(e.target.value); onValueChange(''); }}
        className="px-4 py-2 bg-transparent border-2 border-black dark:border-white/40 rounded-full text-xs font-bold text-black dark:text-white appearance-none cursor-pointer w-full sm:w-40"
      >
        <option value="">Filter by...</option>
        {filterFields.map(f => (

          <option key={f.uid} value={f.uid} className="text-black">{f.label}</option>
        ))}
      </select>

      {activeField && (
        <select
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          className="px-5 py-2.5 bg-transparent border-2 border-black dark:border-white/40 rounded-full text-sm font-bold text-black dark:text-white appearance-none cursor-pointer"
        >
          <option value="">Any</option>
          {activeField.options.map(opt => (
            <option key={opt} value={opt} className="text-black">{opt}</option>
          ))}
        </select>
      )}

      {(selectedField || selectedValue) && (
        <button
          onClick={() => { onFieldChange(''); onValueChange(''); }}
          className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-red-500"
        >
          Clear filter
        </button>
      )}
    </div>
  );
};