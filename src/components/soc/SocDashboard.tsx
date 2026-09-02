import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  BellRing,
  Flame,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const SocDashboard: React.FC = () => {
  const { alerts, incidents, securityEvents, eventsCountToday, setActiveNav, setSelectedAlert, setSelectedIncident } = useApp();

  const criticalAlerts = alerts.filter(a => a.severity === 'Critical');
  const openIncidents = incidents.filter(i => i.status !== 'Closed');

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Security Operations Center (SOC) Live SIEM Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time event correlation, MITRE ATT&CK mapping, alert triage queue, and active incident response
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>OpenSearch Cluster Health: Green</span>
          </span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveNav('alerts')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs cursor-pointer hover:border-red-500/80 transition-all hover:shadow-sm"
        >
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Critical P1 Alerts</div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 font-mono">{criticalAlerts.length} Active</div>
          <div className="text-xs text-red-500 font-bold mt-1">Requires immediate triage</div>
        </div>

        <div
          onClick={() => setActiveNav('incidents')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs cursor-pointer hover:border-orange-500/80 transition-all hover:shadow-sm"
        >
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Open Incidents (War Room)</div>
          <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-1 font-mono">{openIncidents.length} Underway</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">SLA Containment: 99.4%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mean Time To Detect</div>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 font-mono">14m 22s</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">▼ -3m from 7-day avg</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm transition-all">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Events Ingested Today</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
            {eventsCountToday.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">142 EPS Avg Throughput</div>
        </div>
      </div>

      {/* Main SOC Layout: Live Alert Queue + Active Incident Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Triage Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-red-500" />
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Live Alert Ingestion Queue
              </h3>
            </div>
            <button
              onClick={() => setActiveNav('alerts')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              View All Alerts ({alerts.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                onClick={() => {
                  setSelectedAlert(alert);
                  setActiveNav('alerts');
                }}
                className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase font-mono shadow-2xs ${
                        alert.severity === 'Critical'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/80'
                          : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {alert.title}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                      {alert.mitreId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    Host: <span className="text-slate-600 dark:text-slate-300 font-mono">{alert.hostname}</span> • Rule: {alert.detectionRule} • Status: <span className="font-semibold text-blue-500">{alert.status}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{alert.timestamp}</div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Investigate →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Active Incidents & Analyst Shift */}
        <div className="space-y-5">
          {/* Active Incidents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  Active Incidents
                </h3>
              </div>
              <button
                onClick={() => setActiveNav('incidents')}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                War Room
              </button>
            </div>

            <div className="space-y-2">
              {incidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    setActiveNav('incidents');
                  }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:border-orange-400/80 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">{inc.id}</span>
                    <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-md uppercase font-mono shadow-2xs">
                      {inc.severity}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                    {inc.title}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
                    <span>Analyst: {inc.assignedAnalyst}</span>
                    <span>Status: {inc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SOC Analyst Shift & Workload */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Active SOC Shift Crew (Tier 1-3)
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shadow-2xs">
                    JD
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">John Doe (Tier 2 Lead)</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Handling INC-2026-0042</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-md border border-emerald-200/80 dark:border-emerald-800/80 font-mono">On Shift</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shadow-2xs">
                    SL
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Sarah Lin (Tier 1 Triage)</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Queue: 4 alerts</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-md border border-emerald-200/80 dark:border-emerald-800/80 font-mono">On Shift</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
