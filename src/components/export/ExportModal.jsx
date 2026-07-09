'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  getExportFieldCatalog,
  getColumnLabelSuggestions,
  saveColumnLabel,
  getExportTemplates,
  saveExportTemplate,
  exportTransactionsToCSV
} from '../../services/export.service';

export const ExportModal = ({ isOpen, onClose }) => {
  const [catalog, setCatalog] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [labels, setLabels] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', categorical: {} });
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getExportFieldCatalog().then(setCatalog);
    getExportTemplates().then(setTemplates);
  }, [isOpen]);

  useEffect(() => {
    selectedKeys.forEach(key => {
      if (!suggestions[key]) {
        getColumnLabelSuggestions(key).then(list =>
          setSuggestions(prev => ({ ...prev, [key]: list }))
        );
      }
    });
  }, [selectedKeys]);

  const categoricalFields = useMemo(() => catalog.filter(f => f.type === 'categorical'), [catalog]);

  const toggleField = (key) => {
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const buildConfig = () => ({
    fields: selectedKeys.map(key => ({
      key,
      label: labels[key] || catalog.find(f => f.key === key)?.label || key
    })),
    filters
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const config = buildConfig();
      await Promise.all(
        config.fields.filter(f => labels[f.key]).map(f => saveColumnLabel(f.key, labels[f.key]))
      );
      await exportTransactionsToCSV(config);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    await saveExportTemplate(templateName.trim(), buildConfig());
    setTemplates(await getExportTemplates());
    setTemplateName('');
  };

  const loadTemplate = (template) => {
    setSelectedKeys(template.config.fields.map(f => f.key));
    const labelMap = {};
    template.config.fields.forEach(f => { labelMap[f.key] = f.label; });
    setLabels(labelMap);
    setFilters(template.config.filters || { dateFrom: '', dateTo: '', categorical: {} });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Transactions">
      <div className="space-y-6 max-h-[65vh] overflow-y-auto p-4 sm:p-6 lg:p-8">

        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Templates</h3>
          <div className="flex gap-2 flex-wrap mb-3">
            {templates.map(t => (
              <button key={t.id} onClick={() => loadTemplate(t)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                {t.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name" className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm" />
            <Button onClick={handleSaveTemplate} className="px-4 py-2 text-sm">Save Template</Button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Fields to export</h3>
            <div className="flex gap-3 text-xs font-bold">
              <button onClick={() => setSelectedKeys(catalog.map(f => f.key))} className="text-blue-500">Select all</button>
              <button onClick={() => setSelectedKeys([])} className="text-gray-400">Clear</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {catalog.map(f => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedKeys.includes(f.key)} onChange={() => toggleField(f.key)} />
                {f.label}
              </label>
            ))}
          </div>
        </section>

        {selectedKeys.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Column names</h3>
            <div className="space-y-2">
              {selectedKeys.map(key => {
                const field = catalog.find(f => f.key === key);
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <span className="sm:w-40 text-xs text-gray-400 shrink-0">{field?.label}</span>
                    <input
                      list={`suggestions-${key}`}
                      value={labels[key] ?? field?.label ?? ''}
                      onChange={(e) => setLabels(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm"
                    />
                    <datalist id={`suggestions-${key}`}>
                      {(suggestions[key] || []).map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-400">From date</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">To date</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoricalFields.map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400">{f.label}</label>
                <select
                  value={filters.categorical[f.key] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, categorical: { ...prev.categorical, [f.key]: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm"
                >
                  <option value="">Any</option>
                  {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
        <Button onClick={onClose} className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white">Cancel</Button>
        <Button onClick={handleExport} disabled={isExporting || selectedKeys.length === 0}>
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>
    </Modal>
  );
};