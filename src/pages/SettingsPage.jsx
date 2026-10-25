import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Database,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Terminal,
  Server
} from 'lucide-react';
import { apiClient } from '../api/client';

export default function SettingsPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getHealth();
      if (res.success) {
        setHealthData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              System Settings & Integration Status
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Verify AI model connectivity, database storage state, live meteorological feeds, and deployment configuration.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gemini AI */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-blue-600" />
              <span>Google Gemini AI</span>
            </span>
            {healthData?.services?.gemini_multimodal_ai === 'active' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                <AlertTriangle className="h-3 w-3" /> Demo Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Model: <code className="font-mono text-slate-800">{healthData?.services?.gemini_model || 'gemini-2.5-flash'}</code>
          </p>
          <p className="text-[11px] text-slate-400">
            {healthData?.services?.gemini_multimodal_ai === 'active'
              ? 'Connected to Google Gemini multimodal vision endpoints.'
              : 'Using high-fidelity simulated vision models. Add GEMINI_API_KEY to activate.'}
          </p>
        </div>

        {/* MongoDB */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-purple-600" />
              <span>Database Storage</span>
            </span>
            {healthData?.services?.database_storage === 'mongodb' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> MongoDB Atlas
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                In-Memory Session
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Persistence: <strong className="text-slate-800">{healthData?.services?.is_storage_persistent ? 'Persistent' : 'Session-only'}</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            {healthData?.services?.database_storage === 'mongodb'
              ? 'Historical audits persist securely in MongoDB Atlas.'
              : 'Add MONGODB_URI to enable persistent cloud storage.'}
          </p>
        </div>

        {/* Weather Feed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CloudSun className="h-4 w-4 text-sky-600" />
              <span>Weather Engine</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <CheckCircle2 className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Provider: <strong className="text-slate-800">Open-Meteo Meteorological API</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            Global real-time temperature, wind speed, gusts, and rain forecasts active.
          </p>
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-600" />
          <span>Environment Setup Guide</span>
        </h4>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            To enable production cloud services, configure the following keys in your local <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-800">.env</code> file or within the <strong>Vercel Project Settings → Environment Variables</strong>:
          </p>

          <div className="rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-slate-200 space-y-2">
            <div>
              <span className="text-slate-400"># Google Gemini Multimodal API Key (Get at https://aistudio.google.com/)</span>
              <br />
              <span className="text-emerald-400">GEMINI_API_KEY</span>=AIzaSy...
            </div>
            <div className="pt-2">
              <span className="text-slate-400"># MongoDB Atlas Connection URI</span>
              <br />
              <span className="text-emerald-400">MONGODB_URI</span>=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true
            </div>
            <div className="pt-2">
              <span className="text-slate-400"># Optional Custom Weather API Key</span>
              <br />
              <span className="text-emerald-400">WEATHER_API_KEY</span>=...
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Server className="h-4 w-4 text-blue-700" />
              <span>Zero-Config Vercel Deployment</span>
            </p>
            <p className="text-blue-800/90 leading-relaxed">
              The project is pre-configured with <code className="font-mono bg-blue-100 px-1 rounded text-blue-900">vercel.json</code>, uniting the React Vite frontend and FastAPI serverless functions under relative <code className="font-mono bg-blue-100 px-1 rounded text-blue-900">/api</code> routes. Simply push to GitHub and import the repository into Vercel!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
