import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThreatHuntQuery } from '../../types';
import { mockThreatHuntQueries } from '../../data/mockData';
import {
  Search,
  Terminal,
  Play,
  Bookmark,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

export const ThreatHunting: React.FC = () => {
  const { securityEvents, eventsCountToday } = useApp();

  const [query, setQuery] = useState(
    'process = "powershell.exe" AND (command_line LIKE "%-enc%" OR command_line LIKE "%bypass%")'
  );
  const [selectedHunt, setSelectedHunt] = useState<ThreatHuntQuery | null>(mockThreatHuntQueries[0] || null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(securityEvents);

  const handleRunHunt = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const q = query.toLowerCase();
      const filtered = securityEvents.filter(
        e =>
          e.message.toLowerCase().includes('powershell') ||
          e.message.toLowerCase().includes('mimikatz') ||
          (e.commandLine && e.commandLine.toLowerCase().includes('powershell')) ||
          e.eventType.toLowerCase().includes('process')
      );
      setResults(filtered.length > 0 ? filtered : securityEvents.slice(0, 3));
    }, 600);
  };

  const handleSelectPrebuilt = (hunt: ThreatHuntQuery) => {
    setSelectedHunt(hunt);
    setQuery(hunt.query);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-500" />
            Threat Hunting & Security Telemetry Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Execute KQL/Lucene queries across OpenSearch telemetry index, Sigma rule matches, and IOC feeds
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 px-3 py-1.5 rounded-lg shadow-2xs">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>{eventsCountToday.toLocaleString()} events in hot storage</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-500" /> Vanguard QL Query Console
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Syntax: KQL / OpenSearch DSL</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          <button
            onClick={handleRunHunt}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
          </button>
        </div>

        {/* Prebuilt Saved Threat Hunts */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Curated Community & SOC Threat Hunts
          </div>
          <div className="flex flex-wrap gap-2">
            {mockThreatHuntQueries.map(hunt => (
              <button
                key={hunt.id}
                onClick={() => handleSelectPrebuilt(hunt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                  selectedHunt?.id === hunt.id
                    ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {hunt.name} <span className="font-mono text-[11px] opacity-80">({hunt.mitreMapping})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Results */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/60">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Query Matches ({results.length} records found)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Execution time: 42ms</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {results.map(evt => (
            <div key={evt.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase font-mono shadow-2xs ${
                      evt.severity === 'Critical'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/80'
                        : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80'
                    }`}
                  >
                    {evt.severity}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{evt.eventType}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono">{evt.hostname}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{evt.timestamp}</span>
              </div>

              <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{evt.message}</div>

              {evt.commandLine && (
                <div className="p-2.5 bg-slate-950 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto select-text shadow-2xs border border-slate-800">
                  {evt.commandLine}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
