import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileCode, Printer, ChevronDown } from 'lucide-react';
import { exportToJSON, exportToCSV, triggerPrint } from '../utils/exportHelpers';

export default function ExportButton({ data, filename = 'construction_report', label = 'Export' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportJSON = () => {
    exportToJSON(data, `${filename}.json`);
    setOpen(false);
  };

  const handleExportCSV = () => {
    const list = Array.isArray(data) ? data : [data];
    exportToCSV(list, `${filename}.csv`);
    setOpen(false);
  };

  const handlePrint = () => {
    triggerPrint();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        <Download className="h-4 w-4 text-slate-500" />
        <span>{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-20">
          <button
            onClick={handleExportJSON}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <FileCode className="h-4 w-4 text-blue-600" />
            <span>Export as JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            <span>Export as CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-t border-slate-100 mt-1 pt-1.5"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
