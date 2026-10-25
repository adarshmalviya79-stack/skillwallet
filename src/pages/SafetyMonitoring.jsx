import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  ArrowRight,
  Info,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
  FileText
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import SeverityBadge from '../components/SeverityBadge';
import ExportButton from '../components/ExportButton';
import { apiClient } from '../api/client';

export default function SafetyMonitoring() {
  const [file, setFile] = useState(null);
  const [siteDesc, setSiteDesc] = useState('');
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [reportMeta, setReportMeta] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a construction site photograph.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (siteDesc.trim()) formData.append('site_description', siteDesc.trim());
      if (projectName.trim()) formData.append('project_name', projectName.trim());

      const res = await apiClient.analyzeSafety(formData);
      if (res.success) {
        setResult(res.data);
        setReportMeta(res.meta);
      } else {
        throw new Error(res.error || 'Failed to complete safety analysis');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSiteDesc('');
    setProjectName('');
    setResult(null);
    setReportMeta(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Construction Site Safety Monitoring
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Multimodal visual hazard detection for PPE compliance, fall protection, and OSHA hazard identification.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <ExportButton data={result} filename="safety_audit_report" label="Export Audit" />
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Inspection</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Image Upload */}
        <div className={`space-y-5 ${result ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <ImageUploader
              file={file}
              onFileSelect={setFile}
              onFileRemove={() => setFile(null)}
              label="Site Photograph"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project / Site Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Skyline Tower - Level 4 Deck"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Description & Trade Notes (Optional)
              </label>
              <textarea
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                rows={3}
                placeholder="e.g. Formwork staging, active crane delivery, framing crew on perimeter..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-sm transition-all ${
                loading || !file
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing Multimodal Vision Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Safety Hazard Analysis</span>
                </>
              )}
            </button>
          </form>

          {/* Guidelines Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Inspection Scope & Limitations</span>
            </h5>
            <p className="leading-relaxed">
              Visual analysis examines visible PPE (hard hats, eye protection, hi-vis vests), perimeter edge protection guardrails, open trenching shoring, and housekeeping hazards.
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              * AI assessments provide decision-support only and do not replace certified safety officer inspections.
            </p>
          </div>
        </div>

        {/* Right Column: Structured Results */}
        {result && (
          <div className="lg:col-span-7 space-y-5">
            {/* Overview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Audit Result
                  </span>
                  <div className="mt-1 flex items-center gap-3">
                    <SeverityBadge level={result.overall_risk_level} size="lg" />
                    <span className="text-xs text-slate-500">
                      Safety Score:{' '}
                      <strong className="text-sm font-bold text-slate-900">{result.safety_score}/100</strong>
                    </span>
                  </div>
                </div>

                {reportMeta?.report_id && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-600">
                    ID: {reportMeta.report_id}
                  </span>
                )}
              </div>

              {/* Score bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Safety Compliance Index</span>
                  <span className="font-semibold">{result.safety_score}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.safety_score > 75
                        ? 'bg-emerald-500'
                        : result.safety_score > 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${result.safety_score}%` }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800">Executive Summary</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Identified Hazards */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Identified Safety Hazards ({result.hazards?.length || 0})</span>
              </h4>

              {result.hazards && result.hazards.length > 0 ? (
                <div className="space-y-3">
                  {result.hazards.map((haz) => (
                    <div
                      key={haz.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{haz.id}</span>
                          <h5 className="text-xs font-bold text-slate-900">{haz.name}</h5>
                        </div>
                        <SeverityBadge level={haz.severity} size="sm" />
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="font-semibold text-slate-700">Category: </span>
                          <span className="text-slate-600">{haz.category}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Visual Evidence: </span>
                          <span className="text-slate-600">{haz.visual_evidence}</span>
                        </div>
                        <div className="rounded-lg bg-blue-50/70 p-2 text-blue-900 border border-blue-100 mt-2">
                          <span className="font-bold">Corrective Action: </span>
                          <span>{haz.corrective_action}</span>
                        </div>
                        {haz.osha_reference && (
                          <div className="text-[11px] text-slate-500">
                            <span>Reference: </span>
                            <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-[10px]">
                              {haz.osha_reference}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>No critical safety hazards detected in the provided image.</span>
                </div>
              )}
            </div>

            {/* Positive Observations & Action Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Compliant Practices Observed</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.positive_observations?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-blue-700">
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Prioritized Action Steps</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.recommendations?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Regulatory Disclaimer:</p>
              <p>{result.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
