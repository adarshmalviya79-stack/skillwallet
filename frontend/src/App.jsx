import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SafetyMonitoring from './pages/SafetyMonitoring';
import CrackAnalysis from './pages/CrackAnalysis';
import PropertyValuation from './pages/PropertyValuation';
import ProjectPlanning from './pages/ProjectPlanning';
import SiteAssistant from './pages/SiteAssistant';
import WeatherAdvisory from './pages/WeatherAdvisory';
import ReportsHistory from './pages/ReportsHistory';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'safety':
        return <SafetyMonitoring />;
      case 'cracks':
        return <CrackAnalysis />;
      case 'valuation':
        return <PropertyValuation />;
      case 'planning':
        return <ProjectPlanning />;
      case 'assistant':
        return <SiteAssistant />;
      case 'weather':
        return <WeatherAdvisory />;
      case 'reports':
        return <ReportsHistory />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
