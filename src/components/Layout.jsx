import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatusBanner from './StatusBanner';
import { apiClient } from '../api/client';

export default function Layout({ activeTab, onSelectTab, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    apiClient.getHealth()
      .then(res => {
        if (res.success) setHealth(res.data);
      })
      .catch(() => {});
  }, []);

  const isDemo = health?.services?.gemini_multimodal_ai !== 'active';
  const isInMemory = health?.services?.database_storage !== 'mongodb';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar
        onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        systemStatus={health}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <StatusBanner
              isDemo={isDemo}
              isInMemory={isInMemory}
              onOpenSettings={() => onSelectTab('settings')}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
