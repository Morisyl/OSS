import { Input } from './Input';

export const DynamicFormRender = ({ fields, formData, onChange, readOnly = false }) => {
  
  // This helper updates the specific JSON key without destroying the rest of the data
  const handleFieldChange = (key, value) => {
    onChange({
      ...formData,
      [key]: value
    });
  };

  if (!fields || fields.length === 0) {
    return <p className="text-gray-400 italic text-sm">No additional fields configured.</p>;
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = formData[field.field_key] || '';

        switch (field.field_type) {
          case 'text':
            return (
              <Input
                key={field.id}
                label={field.field_label}
                value={value}
                onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                required={field.is_required}
                disabled={readOnly}
              />
            );

          case 'date':
            return (
              <Input
                key={field.id}
                type="date"
                label={field.field_label}
                value={value}
                onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                required={field.is_required}
                disabled={readOnly}
              />
            );

          case 'dropdown':
            // Assumes field.options is a JSON array like: ["Tech", "Health", "Finance"]
            return (
              <div key={field.id} className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  {field.field_label} {field.is_required && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={value}
                  onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl text-sm font-medium focus:border-black dark:focus:border-white focus:ring-0 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required={field.is_required}
                  disabled={readOnly}
                >
                  <option value="" disabled>Select an option...</option>
                  {(field.options || []).map((opt, index) => (
                    <option key={index} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );

          default:
            return null; // Unknown field type
        }
      })}
    </div>
  );
};