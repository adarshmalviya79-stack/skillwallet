import React, { useState } from 'react';
import {
  SearchCode,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import SeverityBadge from '../components/SeverityBadge';
import ExportButton from '../components/ExportButton';
import { apiClient } from '../api/client';

export default function CrackAnalysis() {
  const [file, setFile] = useState(null);
  const [surfaceContext, setSurfaceContext] = useState('');
  const [elementName, setElementName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [reportMeta, setReportMeta] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or upload a concrete or building surface photograph.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (surfaceContext.trim()) formData.append('surface_context', surfaceContext.trim());
      if (elementName.trim()) formData.append('element_name', elementName.trim());

      const res = await apiClient.analyzeCracks(formData);
      if (res.success) {
        setResult(res.data);
        setReportMeta(res.meta);
      } else {
        throw new Error(res.error || 'Failed to complete crack assessment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSurfaceContext('');
    setElementName('');
    setResult(null);
    setReportMeta(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
              <SearchCode className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Structural Crack Detection & Analysis
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Multimodal visual inspection of concrete, masonry, and drywall surfaces for crack patterns, severity, and forensic triage.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <ExportButton data={result} filename="structural_crack_report" label="Export Report" />
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Surface Scan</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <div className={`space-y-5 ${result ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <ImageUploader
              file={file}
              onFileSelect={setFile}
              onFileRemove={() => setFile(null)}
              label="Concrete or Building Surface Photo"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Structural Element / Location (Optional)
              </label>
              <input
                type="text"
                value={elementName}
                onChange={(e) => setElementName(e.target.value)}
                placeholder="e.g. Basement Foundation Wall, Beam Joint, Exterior Facade"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Surface & Age Context (Optional)
              </label>
              <textarea
                value={surfaceContext}
                onChange={(e) => setSurfaceContext(e.target.value)}
                rows={3}
                placeholder="e.g. 15-year-old reinforced concrete wall, subject to freeze-thaw cycles, indoor dry area..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-sm transition-all ${
                loading || !file
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-purple-600 hover:bg-purple-500 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Analyzing Surface Geometry & Patterns...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Detect & Analyze Cracks</span>
                </>
              )}
            </button>
          </form>

          {/* Forensic Disclaimer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span>Engineering Limitations Notice</span>
            </h5>
            <p className="leading-relaxed">
              Photographic AI cannot measure exact sub-millimeter crack depths, gauge ongoing dynamic movement, or determine internal steel reinforcement rebar oxidation without calibrated physical tell-tales and ultrasonic testing.
            </p>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="lg:col-span-7 space-y-5">
            {/* Structural engineer warning */}
            {result.requires_structural_engineer && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Licensed Structural Engineer Inspection Recommended
                  </h4>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    The observed crack morphology indicates potential load redistribution, shear distress, or foundation settlement. Do not attempt structural cosmetic patching before obtaining certified on-site engineering verification.
                  </p>
                </div>
              </div>
            )}

            {/* Overview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Surface Diagnostic
                  </span>
                  <div className="mt-1 flex items-center gap-3">
                    <SeverityBadge level={result.overall_severity} size="lg" />
                    <span className="text-xs text-slate-500">
                      Confidence:{' '}
                      <strong className="text-slate-800">{result.confidence_level}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400">Surface Type</span>
                  <p className="text-xs font-bold text-slate-800">{result.surface_type}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800">Visual Assessment Summary</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {result.summary}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-purple-50/70 p-3 text-xs text-purple-900 border border-purple-100">
                <span className="font-bold">Immediate Recommendation: </span>
                <span>{result.immediate_recommendation}</span>
              </div>
            </div>

            {/* Observed Cracks List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span>Observed Crack Features ({result.observed_cracks?.length || 0})</span>
              </h4>

              {result.observed_cracks?.map((crack) => (
                <div
                  key={crack.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500">{crack.id}</span>
                      <h5 className="font-bold text-slate-900">{crack.crack_type} Crack</h5>
                    </div>
                    <SeverityBadge level={crack.visual_severity} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>
                      <span className="font-semibold text-slate-700">Pattern: </span>
                      <span>{crack.pattern}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Location: </span>
                      <span>{crack.location}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700">Visual Characteristics: </span>
                    <span className="text-slate-600">{crack.visual_characteristics}</span>
                  </div>

                  {crack.direction && (
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold">Orientation: </span>
                      <span>{crack.direction}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Causes vs Unobservable Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Probable Causes</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.probable_causes?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-slate-700">
                  <HelpCircle className="h-4 w-4 text-slate-500" />
                  <span>Unobservable from Photo</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.unobservable_factors?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Disclaimer:</p>
              <p>{result.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
