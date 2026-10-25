export const exportToJSON = (data, filename = 'report.json') => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportToCSV = (items, filename = 'reports.csv') => {
  if (!items || !items.length) return;
  const headers = Object.keys(items[0]).join(',');
  const rows = items.map(item => 
    Object.values(item).map(val => {
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent([headers, ...rows].join('\n'))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const triggerPrint = () => {
  window.print();
};
