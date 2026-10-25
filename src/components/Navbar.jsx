import React from 'react';
import { Menu, ShieldCheck, Activity, HardHat } from 'lucide-react';

export default function Navbar({ onToggleSidebar, activeTab, onSelectTab, systemStatus }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger & Platform Title with screenshot tags */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                  Multimodal Construction Intelligence Platform
                </h1>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                  Real Estate
                </span>
                <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                  Individual
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 ml-1">
                  • AI Decision Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status Pill & Quick Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">System Online</span>
          </div>

          <button
            onClick={() => onSelectTab('settings')}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Settings & APIs
          </button>
        </div>
      </div>
    </header>
  );
}
