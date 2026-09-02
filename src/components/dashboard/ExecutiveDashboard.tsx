import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Wrench,
  Monitor,
  Activity,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Server,
  Laptop,
  CheckCircle2,
  Lock,
  Globe,
  Radio
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    currentOrg,
    endpoints,
    patches,
    vulnerabilities,
    alerts,
    incidents,
    eventsCountToday,
    setActiveNav,
    setSelectedEndpoint,
    remediateVulnerability,
    deployPatch
  } = useApp();

  // Dynamic calculations
  const totalEndpoints = currentOrg.endpointCount;
  const onlineEndpoints = Math.round(totalEndpoints * 0.982);
  const criticalMissingPatches = patches.reduce((sum, p) => p.severity === 'Critical' ? sum + p.applicableEndpointsCount : sum, 0);
  const zeroDayVulns = vulnerabilities.filter(v => v.isCisaKev || v.hasExploitAvailable).length;
  const openAlerts = alerts.filter(a => a.status !== 'Closed' && a.status !== 'False Positive');
  const criticalAlerts = openAlerts.filter(a => a.severity === 'Critical');

  // Priority remediation candidates
  const priorityEndpoints = endpoints.filter(e => e.riskScore >= 70).slice(0, 4);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Endpoint Health */}
        <div
          onClick={() => setActiveNav('endpoints')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm hover:border-blue-400/80 dark:hover:border-blue-700/80 transition-all cursor-pointer group"
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase mb-1 tracking-wider flex items-center justify-between">
            <span>Endpoint Health</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-mono">
              {totalEndpoints.toLocaleString()}
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-0.5 whitespace-nowrap font-mono">
              <span>▲ 98.2% Online</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full w-[98.2%]"></div>
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-slate-400 font-medium">
            <span>{onlineEndpoints} Online</span>
            <span className="text-amber-500 dark:text-amber-400 font-semibold">14 At-Risk</span>
          </div>
        </div>

        {/* Patch Compliance */}
        <div
          onClick={() => setActiveNav('patches')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm hover:border-orange-400/80 dark:hover:border-orange-700/80 transition-all cursor-pointer group"
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase mb-1 tracking-wider flex items-center justify-between">
            <span>Patch Compliance</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-mono">
              84%
            </div>
            <div className="text-red-500 dark:text-red-400 text-xs font-bold whitespace-nowrap font-mono">
              {criticalMissingPatches} Critical
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-1.5 rounded-full w-[84%]"></div>
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-slate-400 font-medium">
            <span>SLA Target: 95%</span>
            <span className="text-blue-500 dark:text-blue-400 font-semibold">2 Pending Reboot</span>
          </div>
        </div>

        {/* Vulnerabilities */}
        <div
          onClick={() => setActiveNav('vulnerabilities')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm hover:border-red-400/80 dark:hover:border-red-700/80 transition-all cursor-pointer group"
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase mb-1 tracking-wider flex items-center justify-between">
            <span>Vulnerabilities</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-mono">
              217
            </div>
            <div className="text-red-600 dark:text-red-400 text-xs font-bold whitespace-nowrap font-mono">
              {zeroDayVulns} Zero-Days (KEV)
            </div>
          </div>
          <div className="mt-3 flex gap-1 h-1.5">
            <div className="bg-red-600 rounded-full w-1/4" title="Critical: 25%"></div>
            <div className="bg-orange-500 rounded-full w-1/3" title="High: 33%"></div>
            <div className="bg-yellow-400 rounded-full w-1/4" title="Medium: 25%"></div>
            <div className="bg-slate-300 dark:bg-slate-700 rounded-full w-1/6" title="Low: 17%"></div>
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-slate-400 font-medium">
            <span className="text-red-500 dark:text-red-400 font-semibold">4 RCE Exploitable</span>
            <span>ConnectSecure Model</span>
          </div>
        </div>

        {/* Open SOC Alerts */}
        <div
          onClick={() => setActiveNav('alerts')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-sm hover:border-indigo-400/80 dark:hover:border-indigo-700/80 transition-all cursor-pointer group"
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase mb-1 tracking-wider flex items-center justify-between">
            <span>Open SOC Alerts</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-mono">
              {openAlerts.length}
            </div>
            <div className="text-blue-600 dark:text-blue-400 text-xs font-bold whitespace-nowrap font-mono">
              {criticalAlerts.length} Critical P1
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
            <span className="text-[10px] text-slate-400 font-bold font-mono">
              Real-time monitoring active (124 eps)
            </span>
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-slate-400 font-medium">
            <span>2 Incidents Open</span>
            <span className="text-indigo-500 dark:text-indigo-400 font-semibold">MTTR: 1h 04m</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Risk Score Gauge + Threat Detection Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-center relative shadow-xs">
          <div className="absolute top-5 left-6 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-orange-500" /> Organization Risk Score
          </div>

          <div className="my-3 mt-6 flex flex-col items-center">
            {/* Visual Circular Meter */}
            <div className="w-36 h-36 rounded-full border-[14px] border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[14px] border-orange-500 border-t-transparent border-r-transparent rotate-[45deg]"></div>
              <div className="text-center z-10">
                <div className="text-4xl font-black text-slate-800 dark:text-slate-100 leading-none font-mono">
                  {currentOrg.riskScore}
                </div>
                <div className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest mt-1">
                  Moderate Risk
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400">Patch Lag</span>
              <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">+16 pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400">Zero-Days</span>
              <span className="font-bold text-red-600 dark:text-red-400 font-mono">+28 pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400">Exposure</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">+12 pts</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400">EDR Coverage</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">-8 pts</span>
            </div>
          </div>
        </div>

        {/* Threat Detection Activity (24h) Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Threat Detection Activity (Last 24 Hours)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ingested across Endpoint Agents, Syslog, EDR, and CloudTrail
              </div>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Normal Events
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-500 animate-pulse"></span> SOC Detections
              </span>
            </div>
          </div>

          {/* Graphic Bar Activity Timeline */}
          <div className="flex-1 flex items-end gap-2.5 h-28 my-2">
            {[
              { total: 65, alert: 0, time: '00:00' },
              { total: 45, alert: 0, time: '02:00' },
              { total: 38, alert: 0, time: '04:00' },
              { total: 55, alert: 0, time: '06:00' },
              { total: 85, alert: 1, time: '08:00' },
              { total: 95, alert: 2, time: '10:00' },
              { total: 78, alert: 0, time: '12:00' },
              { total: 92, alert: 3, time: '14:00' },
              { total: 88, alert: 1, time: '16:00' },
              { total: 72, alert: 0, time: '18:00' },
              { total: 60, alert: 0, time: '20:00' },
              { total: 100, alert: 4, time: 'Now' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm relative overflow-hidden flex flex-col justify-end transition-all group-hover:opacity-80"
                  style={{ height: `${bar.total}%` }}
                >
                  <div
                    className="w-full bg-blue-500/80 dark:bg-blue-600"
                    style={{ height: `${bar.total - (bar.alert > 0 ? 30 : 0)}%` }}
                  />
                  {bar.alert > 0 && (
                    <div
                      className="w-full bg-red-500"
                      style={{ height: `${bar.alert * 18}%` }}
                    />
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">{bar.time}</span>
              </div>
            ))}
          </div>

          {/* Bottom SOC Operational Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Mean Time to Detect (MTTD)</div>
              <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">14m 22s</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">▼ -3m from last week</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Mean Time to Respond (MTTR)</div>
              <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">1h 04m</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">▼ -18m SLA compliant</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Events Ingested Today</div>
              <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                {eventsCountToday.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Normalized schema pipeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Remediation Needed Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Priority Remediation Needed (Risk-Ranked Assets)
              </h3>
              <p className="text-[11px] text-slate-400">
                Calculated via: Severity × Exploitability (CISA KEV) × Exposure × Asset Criticality
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('endpoints')}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Fleet Assets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3">Endpoint & OS</th>
                <th className="px-6 py-3">Calculated Risk</th>
                <th className="px-6 py-3">Missing Patches</th>
                <th className="px-6 py-3">CVE Vulnerabilities</th>
                <th className="px-6 py-3">Exposure</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {priorityEndpoints.map(ep => (
                <tr
                  key={ep.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div
                      onClick={() => {
                        setSelectedEndpoint(ep);
                        setActiveNav('endpoints');
                      }}
                      className="flex flex-col cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {ep.hostname}
                        </span>
                        {ep.isIsolated && (
                          <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md font-bold uppercase font-mono">
                            Quarantined
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {ep.osName} • {ep.ipAddress}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase whitespace-nowrap font-mono ${
                          ep.riskScore >= 80
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                        }`}
                      >
                        {ep.riskScore >= 80 ? 'Critical' : 'High'} ({ep.riskScore})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-300 font-mono">
                    {ep.missingPatchesCount} ({ep.criticalPatchesCount} Critical)
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-600 dark:text-red-400 font-bold font-mono">{ep.criticalVulnsCount} Critical</span>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(ep.criticalVulnsCount, 4) }).map((_, i) => (
                          <span key={i} className="w-2 h-2 bg-red-500 rounded-xs inline-block" />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    {ep.isInternetFacing ? (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-[11px]">
                        <Globe className="w-3 h-3" /> Public DMZ
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Internal Private</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedEndpoint(ep);
                          setActiveNav('endpoints');
                        }}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          deployPatch('patch-001', ep.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs shadow-blue-500/20 active:scale-[0.98] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                      >
                        Remediate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
