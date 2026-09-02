import React from 'react';
import { useApp, MainNavTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Monitor,
  ShieldAlert,
  Wrench,
  Flame,
  Search,
  Grid,
  FileCode,
  GitFork,
  FileText,
  Settings,
  BellRing,
  Activity,
  Shield,
  Laptop
} from 'lucide-react';

interface NavItem {
  id: MainNavTab;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, currentUser, setUserRole, alerts, incidents } = useApp();

  const openAlertsCount = alerts.filter(a => a.status === 'New' || a.status === 'Investigating').length;
  const activeIncidentsCount = incidents.filter(i => i.status !== 'Closed').length;

  const operationsNav: NavItem[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'endpoints', label: 'Endpoints (RMM)', icon: <Monitor className="w-4 h-4" />, badge: '1.2k' },
    { id: 'patches', label: 'Patch Management', icon: <Wrench className="w-4 h-4" />, badge: '42' },
    { id: 'vulnerabilities', label: 'Vulnerability & Risk', icon: <ShieldAlert className="w-4 h-4" />, badge: '8 Zero-Day', badgeColor: 'bg-red-950 text-red-400 border border-red-800' }
  ];

  const securityNav: NavItem[] = [
    { id: 'soc', label: 'SOC Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'alerts', label: 'Security Alerts', icon: <BellRing className="w-4 h-4" />, badge: openAlertsCount, badgeColor: 'bg-red-600 text-white' },
    { id: 'incidents', label: 'Incident Response', icon: <Flame className="w-4 h-4" />, badge: activeIncidentsCount, badgeColor: 'bg-orange-600 text-white' },
    { id: 'hunting', label: 'Threat Hunting', icon: <Search className="w-4 h-4" /> },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: <Grid className="w-4 h-4" /> }
  ];

  const automationNav: NavItem[] = [
    { id: 'rules', label: 'Custom Rules', icon: <FileCode className="w-4 h-4" /> },
    { id: 'workflows', label: 'Automation Playbooks', icon: <GitFork className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Compliance', icon: <FileText className="w-4 h-4" /> }
  ];

  const adminNav: NavItem[] = [
    { id: 'admin', label: 'Administration & RBAC', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <nav className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              VANGUARD <span className="text-blue-400 font-semibold text-xs px-1.5 py-0.5 bg-blue-950/80 border border-blue-800/60 rounded">OPS</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium tracking-wide">
              Unified RMM & SOC SIEM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto space-y-6 px-3">
        {/* Operations Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Operations & Fleet
          </div>
          <div className="space-y-1">
            {operationsNav.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-2xs'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md whitespace-nowrap ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Security / SOC Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>SOC & SIEM</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Telemetry Live" />
          </div>
          <div className="space-y-1">
            {securityNav.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-2xs'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md whitespace-nowrap ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Rules & Automation */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Automation & Insights
          </div>
          <div className="space-y-1">
            {automationNav.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-2xs'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Management & Admin */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            System
          </div>
          <div className="space-y-1">
            {adminNav.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-2xs'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer Profile & Role Simulator */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-700/80 text-white font-bold flex items-center justify-center text-xs ring-1 ring-blue-500 shadow-xs">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <select
                id="role-switcher-select"
                aria-label="Switch User Role"
                value={currentUser.role}
                onChange={e => setUserRole(e.target.value as any)}
                className="bg-slate-900 text-blue-400 text-[10px] font-bold border border-slate-700/80 rounded-md px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="SOC Admin">SOC Admin</option>
                <option value="Security Analyst">Security Analyst</option>
                <option value="IT Admin">IT Admin</option>
                <option value="MSP Admin">MSP Admin</option>
                <option value="Read-only">Read-only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
