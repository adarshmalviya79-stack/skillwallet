import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCode,
  Building,
  CalendarCheck,
  MessageSquareText,
  CloudSun,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'safety', label: 'Safety Monitoring', icon: ShieldAlert, badge: 'Vision' },
  { id: 'cracks', label: 'Crack Analysis', icon: SearchCode, badge: 'Vision' },
  { id: 'valuation', label: 'Property Valuation', icon: Building, badge: 'AVM' },
  { id: 'planning', label: 'Project Planning', icon: CalendarCheck, badge: 'CPM' },
  { id: 'assistant', label: 'Site Assistant', icon: MessageSquareText, badge: 'AI' },
  { id: 'weather', label: 'Weather Advisory', icon: CloudSun, badge: 'Live' },
  { id: 'reports', label: 'Reports & History', icon: FileSpreadsheet, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:static ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Feature Card or Collapse button */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 hidden lg:block">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
              <div className="flex items-center gap-1.5 font-bold text-blue-800">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Multimodal AI Active</span>
              </div>
              <p className="mt-1 text-[11px] text-blue-700/90 leading-tight">
                Integrates Gemini vision, engineering formulas & real-time weather.
              </p>
            </div>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-end p-2 border-t border-slate-100">
          <button
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
