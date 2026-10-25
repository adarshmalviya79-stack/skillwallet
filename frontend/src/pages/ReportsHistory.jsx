import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  RotateCcw,
  Database,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import ExportButton from '../components/ExportButton';
import Modal from '../components/Modal';
import { apiClient } from '../api/client';
import { formatDate } from '../utils/formatters';

export default function ReportsHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [storageMeta, setStorageMeta] = useState(null);

  // Detail Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filterType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getReports(filterType || null, searchTerm || null);
      if (res.success) {
        setReports(res.data);
        setStorageMeta(res.meta);
      } else {
        throw new Error(res.error || 'Failed to load report history');
      }
    } catch (err) {
      setError(err.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadReports();
  };

  const openReportDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await apiClient.getReportDetail(id);
      if (res.success) {
        setSelectedReport(res.data);
      }
    } catch (err) {
      alert(`Could not load report details: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await apiClient.deleteReport(deleteTarget.id);
      setReports(reports.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Failed to delete report: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Inspection Reports & Project History
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Audit logs for site safety inspections, structural crack assessments, property valuations, and CPM schedules.
          </p>
        </div>

        {reports.length > 0 && (
          <ExportButton data={reports} filename="all_construction_reports" label="Export All" />
        )}
      </div>

      {/* Storage Mode Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600" />
          <span>
            Storage Engine:{' '}
            <strong className="text-slate-900">
              {storageMeta?.storage_type === 'mongodb' ? 'MongoDB Atlas Cluster (Persistent)' : 'In-Memory Session (Ephemeral)'}
            </strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {reports.length} total report(s) found
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: '', label: 'All Audits' },
            { id: 'safety', label: 'Safety' },
            { id: 'crack', label: 'Crack' },
            { id: 'valuation', label: 'Valuation' },
            { id: 'planning', label: 'Planning' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                filterType === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword..."
              className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Search
          </button>
        </form>
      </div>

      {/* Reports Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-400">Loading audit records...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">ID / Type</th>
                  <th className="px-5 py-3.5">Title & Executive Summary</th>
                  <th className="px-5 py-3.5">Date Logged</th>
                  <th className="px-5 py-3.5">Risk / Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-500">#{report.id}</span>
                      <div className="mt-0.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {report.type}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-md">
                      <h5 className="font-bold text-slate-900 truncate">{report.title}</h5>
                      <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                        {report.summary}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                      {formatDate(report.created_at)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <SeverityBadge level={report.risk_level} size="sm" />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => openReportDetail(report.id)}
                        className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Report Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(report)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto" />
            <p>No reports found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.title || 'Report Details'}
        maxWidth="max-w-3xl"
      >
        {selectedReport && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Type: {selectedReport.type} • ID: #{selectedReport.id}
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">Logged: {formatDate(selectedReport.created_at)}</p>
              </div>
              <SeverityBadge level={selectedReport.risk_level} size="md" />
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1">Executive Summary:</h5>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-relaxed">
                {selectedReport.summary}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1">Structured Payload:</h5>
              <pre className="max-h-80 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-slate-200">
                {JSON.stringify(selectedReport.data, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <ExportButton data={selectedReport} filename={`report_${selectedReport.id}`} label="Export Report" />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Report Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to permanently delete audit record{' '}
            <strong className="text-slate-900">"{deleteTarget?.title}"</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
