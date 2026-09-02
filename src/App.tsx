/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/layout/ToastContainer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { AISecurityAssistant } from './components/layout/AISecurityAssistant';
import { AgentInstallModal } from './components/common/AgentInstallModal';

import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { EndpointInventory } from './components/endpoints/EndpointInventory';
import { PatchManagement } from './components/patches/PatchManagement';
import { VulnerabilityManagement } from './components/vulnerabilities/VulnerabilityManagement';
import { SocDashboard } from './components/soc/SocDashboard';
import { AlertsInvestigation } from './components/alerts/AlertsInvestigation';
import { IncidentResponse } from './components/incidents/IncidentResponse';
import { ThreatHunting } from './components/hunting/ThreatHunting';
import { MitreMatrix } from './components/mitre/MitreMatrix';
import { CustomRules } from './components/rules/CustomRules';
import { AutomationWorkflows } from './components/workflows/AutomationWorkflows';
import { ReportsView } from './components/reports/ReportsView';
import { AdminManagement } from './components/admin/AdminManagement';

const AppContent: React.FC = () => {
  const { activeNav } = useApp();

  const renderActiveView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'endpoints':
        return <EndpointInventory />;
      case 'patches':
        return <PatchManagement />;
      case 'vulnerabilities':
        return <VulnerabilityManagement />;
      case 'soc':
        return <SocDashboard />;
      case 'alerts':
        return <AlertsInvestigation />;
      case 'incidents':
        return <IncidentResponse />;
      case 'hunting':
        return <ThreatHunting />;
      case 'mitre':
        return <MitreMatrix />;
      case 'rules':
        return <CustomRules />;
      case 'workflows':
        return <AutomationWorkflows />;
      case 'reports':
        return <ReportsView />;
      case 'admin':
        return <AdminManagement />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <GlobalSearchModal />
      <AgentInstallModal />
      <AISecurityAssistant />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
