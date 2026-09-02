import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SOCAlert } from '../../types';
import {
  BellRing,
  Search,
  Filter,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  Terminal,
  FileCode,
  Clock,
  User,
  X,
  Download
} from 'lucide-react';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportAlertsData } from '../../utils/exportUtils';

export const AlertsInvestigation: React.FC = () => {
  const {
    alerts,
    selectedAlert,
    setSelectedAlert,
    updateAlertStatus,
    escalateAlertToIncident,
    isolateEndpoint,
    setActiveNav,
    currentOrg
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.hostname.toLowerCase().includes(q) ||
        a.mitreId.toLowerCase().includes(q) ||
        a.detectionRule.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-500">
              <BellRing className="w-5 h-5" />
            </div>
            Security Alerts & Triage Investigation Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingested from EDR, Syslog, Firewall, and Identity telemetry correlated with Sigma & MITRE ATT&CK rules
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Triaged">Triaged</option>
            <option value="Contained">Contained</option>
            <option value="Closed">Closed</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alerts, hostnames, MITRE..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <ExportDropdown
            label="Export"
            entityName="Alerts"
            totalCount={alerts.length}
            filteredCount={filteredAlerts.length}
            onExportCSV={() => {
              const filterSummary = `Severity: ${filterSeverity}, Status: ${filterStatus}${
                searchQuery ? `, Search: "${searchQuery}"` : ''
              }`;
              exportAlertsData(filteredAlerts, filterSummary, 'csv', currentOrg.name);
            }}
            onExportPDF={() => {
              const filterSummary = `Severity: ${filterSeverity}, Status: ${filterStatus}${
                searchQuery ? `, Search: "${searchQuery}"` : ''
              }`;
              exportAlertsData(filteredAlerts, filterSummary, 'pdf', currentOrg.name);
            }}
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Alert Title & Detection Rule</th>
              <th className="px-4 py-3">Target Hostname & IP</th>
              <th className="px-4 py-3">MITRE ATT&CK</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAlerts.map(alert => (
              <tr
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase font-mono shadow-2xs ${
                      alert.severity === 'Critical'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : alert.severity === 'High'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="px-4 py-3.5 max-w-sm">
                  <div className="font-bold text-slate-800 dark:text-slate-100">{alert.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{alert.detectionRule}</div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{alert.hostname}</div>
                  <div className="text-[10px] font-mono text-slate-400">{alert.ipAddress}</div>
                </td>

                <td className="px-4 py-3.5 font-mono">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 rounded-md text-[10px] font-bold shadow-2xs">
                    {alert.mitreId}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-sans">{alert.mitreTechnique}</div>
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs whitespace-nowrap ${
                      alert.status === 'New'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800/80'
                        : alert.status === 'Investigating'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80'
                        : alert.status === 'Contained'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                    }`}
                  >
                    {alert.status}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-slate-400 font-mono text-[10px]">
                  {alert.timestamp}
                </td>

                <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Forensic Investigation Drawer Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 select-none animate-in fade-in-50">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase font-mono shadow-2xs ${
                    selectedAlert.severity === 'Critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                  }`}
                >
                  {selectedAlert.severity}
                </span>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  {selectedAlert.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedAlert.description}</p>

              {/* Grid Context */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Target Host</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedAlert.hostname}</div>
                  <div className="text-[10px] font-mono text-slate-400">{selectedAlert.ipAddress}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">MITRE ATT&CK</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">{selectedAlert.mitreId}</div>
                  <div className="text-[10px] text-slate-400">{selectedAlert.mitreTactic}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Triage Status</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedAlert.status}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Detection Rule</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{selectedAlert.detectionRule}</div>
                </div>
              </div>

              {/* Forensic Evidence Items */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-500" /> Correlated Forensic Evidence & Artifacts
                </div>
                <div className="p-3.5 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed select-text space-y-1">
                  {selectedAlert.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-500 font-mono">[{idx + 1}]</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'Investigating');
                      setSelectedAlert(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Mark Investigating
                  </button>
                  <button
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'Closed');
                      setSelectedAlert(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Close Alert
                  </button>
                  <button
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'False Positive');
                      setSelectedAlert(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    False Positive
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      isolateEndpoint(selectedAlert.endpointId);
                      setSelectedAlert(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Lock className="w-3.5 h-3.5" /> Isolate Host
                  </button>

                  <button
                    onClick={() => {
                      escalateAlertToIncident(selectedAlert.id);
                      setSelectedAlert(null);
                      setActiveNav('incidents');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Flame className="w-3.5 h-3.5" /> Escalate to Incident
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
