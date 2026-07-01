const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

export const toCSV = (rows, columns) => {
  const header = columns.map(c => escapeCsvValue(c.label)).join(',');
  const body = rows.map(row =>
    columns.map(c => escapeCsvValue(row[c.key])).join(',')
  ).join('\n');
  return `${header}\n${body}`;
};

export const downloadCSV = (filename, csvString) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};