import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Monitor,
  ShieldAlert,
  BellRing,
  Wrench,
  FileCode,
  ArrowRight,
  X,
  Flame
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    endpoints,
    vulnerabilities,
    alerts,
    incidents,
    patches,
    customRules,
    setSelectedEndpoint,
    setSelectedAlert,
    setSelectedIncident,
    setActiveNav
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingEndpoints = q
    ? endpoints.filter(
        e =>
          e.hostname.toLowerCase().includes(q) ||
          e.ipAddress.includes(q) ||
          e.osName.toLowerCase().includes(q) ||
          (e.publicIp && e.publicIp.includes(q))
      )
    : [];

  const matchingVulns = q
    ? vulnerabilities.filter(
        v =>
          v.cve.toLowerCase().includes(q) ||
          v.title.toLowerCase().includes(q) ||
          v.affectedSoftware.toLowerCase().includes(q)
      )
    : [];

  const matchingAlerts = q
    ? alerts.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.hostname.toLowerCase().includes(q) ||
          a.mitreId.toLowerCase().includes(q) ||
          a.detectionRule.toLowerCase().includes(q)
      )
    : [];

  const matchingIncidents = q
    ? incidents.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q)
      )
    : [];

  const matchingPatches = q
    ? patches.filter(
        p =>
          p.kbOrId.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.product.toLowerCase().includes(q)
      )
    : [];

  const matchingRules = q
    ? customRules.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchingEndpoints.length > 0 ||
    matchingVulns.length > 0 ||
    matchingAlerts.length > 0 ||
    matchingIncidents.length > 0 ||
    matchingPatches.length > 0 ||
    matchingRules.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-950">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            placeholder="Search endpoints (NYC-PROD-SQL01), CVEs (CVE-2024-38077), alerts, KB patches..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-8">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Search Suggestions
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['CVE-2024-38077', 'NYC-PROD-SQL01', 'KB5039211', 'PowerShell', 'Firewall', 'Incident'].map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No matching assets, CVEs, or security events found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Endpoints */}
              {matchingEndpoints.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Monitor className="w-3 h-3 text-blue-500" /> Endpoints ({matchingEndpoints.length})
                  </div>
                  <div className="space-y-1">
                    {matchingEndpoints.map(ep => (
                      <div
                        key={ep.id}
                        onClick={() => {
                          setSelectedEndpoint(ep);
                          setActiveNav('endpoints');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            {ep.hostname}
                            <span className="text-[10px] font-normal text-slate-400">{ep.ipAddress}</span>
                            {ep.isIsolated && (
                              <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1.5 py-0.2 rounded font-bold uppercase">
                                ISOLATED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{ep.osName} • Risk: {ep.riskScore}/100</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vulnerabilities */}
              {matchingVulns.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-red-500" /> Vulnerabilities & CVEs ({matchingVulns.length})
                  </div>
                  <div className="space-y-1">
                    {matchingVulns.map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setActiveNav('vulnerabilities');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span className="text-red-600 font-mono">{v.cve}</span>
                            <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 px-1.5 rounded font-bold">
                              CVSS {v.cvssScore}
                            </span>
                            {v.isCisaKev && (
                              <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 px-1 rounded font-bold uppercase">
                                CISA KEV
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{v.title}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts & Incidents */}
              {(matchingAlerts.length > 0 || matchingIncidents.length > 0) && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BellRing className="w-3 h-3 text-orange-500" /> SOC Alerts & Incidents
                  </div>
                  <div className="space-y-1">
                    {matchingAlerts.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedAlert(a);
                          setActiveNav('alerts');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span>{a.title}</span>
                            <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 rounded uppercase font-bold">
                              {a.severity}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{a.hostname} • {a.mitreTechnique}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                    {matchingIncidents.map(inc => (
                      <div
                        key={inc.id}
                        onClick={() => {
                          setSelectedIncident(inc);
                          setActiveNav('incidents');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Flame className="w-3 h-3 text-orange-600" />
                            <span>{inc.id}: {inc.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">Status: {inc.status} • Analyst: {inc.assignedAnalyst}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patches */}
              {matchingPatches.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-blue-500" /> Patches ({matchingPatches.length})
                  </div>
                  <div className="space-y-1">
                    {matchingPatches.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveNav('patches');
                          setIsSearchOpen(false);
                        }}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 font-mono">
                            {p.kbOrId} - {p.product}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{p.title}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono text-[10px]">ESC</kbd> to close</span>
          <span>Unified RMM, Risk & SIEM Index</span>
        </div>
      </div>
    </div>
  );
};
