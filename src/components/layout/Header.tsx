import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Building2,
  Moon,
  Sun,
  Sparkles,
  Radio,
  Bell,
  CheckCircle2,
  ChevronDown,
  Shield,
  Laptop
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentOrg,
    organizations,
    switchOrg,
    theme,
    toggleTheme,
    isLiveSimulationActive,
    toggleLiveSimulation,
    setIsSearchOpen,
    setIsAiAssistantOpen,
    alerts,
    setActiveNav,
    setSelectedAlert,
    activeNav
  } = useApp();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeNav) {
      case 'dashboard': return 'Executive Security Overview';
      case 'endpoints': return 'Endpoint Fleet Inventory (RMM)';
      case 'patches': return 'Patch Management & Deployment';
      case 'vulnerabilities': return 'Vulnerability & Risk Matrix';
      case 'soc': return 'Security Operations Center (SOC/SIEM)';
      case 'alerts': return 'Security Alerts Investigation';
      case 'incidents': return 'Incident Response & Case Management';
      case 'hunting': return 'Threat Hunting & Log Analytics';
      case 'mitre': return 'MITRE ATT&CK Enterprise Matrix';
      case 'rules': return 'Custom Security & Compliance Rules';
      case 'workflows': return 'Automation & Orchestration Playbooks';
      case 'reports': return 'Executive, Compliance & SLA Reports';
      case 'admin': return 'Multi-Tenant Administration & RBAC';
      default: return 'Cybersecurity Console';
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' || a.severity === 'High');

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 select-none transition-colors">
      {/* Left: Organization Switcher & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            id="header-org-dropdown-button"
            onClick={() => setIsOrgDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="max-w-[140px] truncate">{currentOrg.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Tenant Organization
              </div>
              <div className="space-y-0.5">
                {organizations.map(org => (
                  <button
                    key={org.id}
                    id={`org-select-${org.id}`}
                    onClick={() => {
                      switchOrg(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      org.id === currentOrg.id
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{org.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{org.endpointCount} endpoints • {org.plan}</div>
                    </div>
                    {org.id === currentOrg.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="text-slate-300 dark:text-slate-700 font-light select-none">/</span>
        <h1 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider hidden sm:inline-block">
          {getPageTitle()}
        </h1>

        <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-blue-200/80 dark:border-blue-800/80 uppercase whitespace-nowrap">
          {currentOrg.plan}
        </span>
      </div>

      {/* Right Actions: Search, Telemetry, AI Assistant, Dark Mode, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Global Search trigger */}
        <button
          id="global-search-trigger-btn"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 text-xs border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs transition-all w-52 sm:w-64 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">Search endpoints, CVEs, alerts...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-600 font-mono text-slate-500 dark:text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Live Stream Telemetry Indicator */}
        <button
          id="toggle-live-simulation-btn"
          onClick={toggleLiveSimulation}
          title={isLiveSimulationActive ? 'Real-time telemetry stream active (Click to pause)' : 'Telemetry stream paused (Click to resume)'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border shadow-2xs transition-all cursor-pointer whitespace-nowrap ${
            isLiveSimulationActive
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isLiveSimulationActive ? 'animate-pulse text-emerald-500' : 'text-slate-400'}`} />
          <span className="hidden md:inline">{isLiveSimulationActive ? 'STREAM LIVE' : 'STREAM PAUSED'}</span>
        </button>

        {/* AI SOC Assistant Trigger */}
        <button
          id="ai-copilot-trigger-btn"
          onClick={() => setIsAiAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="hidden md:inline">AI SOC Copilot</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setIsNotifOpen(prev => !prev)}
            aria-label="Open Notifications"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {criticalAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-100">Live SOC Alerts ({criticalAlerts.length})</div>
                <button
                  onClick={() => {
                    setActiveNav('alerts');
                    setIsNotifOpen(false);
                  }}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {criticalAlerts.slice(0, 4).map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSelectedAlert(a);
                      setActiveNav('alerts');
                      setIsNotifOpen(false);
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase whitespace-nowrap ${
                        a.severity === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                      }`}>
                        {a.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{a.timestamp.split(' ')[1]}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{a.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{a.hostname} • {a.mitreId}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light SOC Mode Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Standard Light Mode' : 'Switch to SOC Dark Mode'}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
