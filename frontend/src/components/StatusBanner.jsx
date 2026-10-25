import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export default function StatusBanner({ isDemo, isInMemory, onOpenSettings }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (!isDemo && !isInMemory)) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-1.5 text-amber-700">
            {isDemo ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900">
              {isDemo ? 'Running in Simulated Demo Mode' : 'In-Memory Session Storage'}
            </h4>
            <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
              {isDemo && isInMemory
                ? 'GEMINI_API_KEY and MONGODB_URI are currently unconfigured. The platform is using high-fidelity simulated models and in-memory storage. All features are fully interactive.'
                : isDemo
                ? 'Google Gemini API is in simulated mode. Configure GEMINI_API_KEY in your environment for live multimodal vision.'
                : 'MongoDB Atlas is unconfigured. Saved reports and projects are kept in an in-memory session and will reset on server restart.'}
            </p>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="mt-2 text-xs font-semibold text-blue-700 underline hover:text-blue-900"
              >
                Configure Keys in Settings →
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 p-1"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
