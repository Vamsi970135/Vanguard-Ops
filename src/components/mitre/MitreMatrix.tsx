import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Grid, ShieldAlert, ArrowRight, CheckCircle2, Search } from 'lucide-react';

interface MitreTechniqueInfo {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  activeAlertsCount: number;
  rulesCount: number;
}

const defaultMitreData: MitreTechniqueInfo[] = [
  { techniqueId: 'T1190', techniqueName: 'Exploit Public-Facing App', tactic: 'Initial Access', activeAlertsCount: 2, rulesCount: 4 },
  { techniqueId: 'T1566', techniqueName: 'Phishing: Spearphishing Link', tactic: 'Initial Access', activeAlertsCount: 1, rulesCount: 6 },
  { techniqueId: 'T1059.001', techniqueName: 'PowerShell', tactic: 'Execution', activeAlertsCount: 3, rulesCount: 8 },
  { techniqueId: 'T1059.004', techniqueName: 'Unix Shell', tactic: 'Execution', activeAlertsCount: 1, rulesCount: 5 },
  { techniqueId: 'T1053.005', techniqueName: 'Scheduled Task / Cron', tactic: 'Persistence', activeAlertsCount: 0, rulesCount: 4 },
  { techniqueId: 'T1543.003', techniqueName: 'Windows Service Creation', tactic: 'Persistence', activeAlertsCount: 0, rulesCount: 3 },
  { techniqueId: 'T1068', techniqueName: 'Exploitation for Privilege Escalation', tactic: 'Privilege Escalation', activeAlertsCount: 1, rulesCount: 5 },
  { techniqueId: 'T1003.001', techniqueName: 'LSASS Memory Dumping', tactic: 'Credential Access', activeAlertsCount: 1, rulesCount: 7 },
  { techniqueId: 'T1110.003', techniqueName: 'Password Spraying', tactic: 'Credential Access', activeAlertsCount: 2, rulesCount: 4 },
  { techniqueId: 'T1082', techniqueName: 'System Information Discovery', tactic: 'Discovery', activeAlertsCount: 0, rulesCount: 2 },
  { techniqueId: 'T1021.001', techniqueName: 'Remote Desktop Protocol', tactic: 'Lateral Movement', activeAlertsCount: 2, rulesCount: 3 },
  { techniqueId: 'T1071.001', techniqueName: 'Web Protocols C2 Beaconing', tactic: 'Command and Control', activeAlertsCount: 1, rulesCount: 5 }
];

export const MitreMatrix: React.FC = () => {
  const { setActiveNav, setSelectedAlert, alerts } = useApp();
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechniqueInfo | null>(null);

  const tactics = Array.from(new Set(defaultMitreData.map(m => m.tactic)));

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Grid className="w-5 h-5 text-blue-500" />
            MITRE ATT&CK Enterprise Matrix & Detection Heatmap
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fleet technique coverage, active alerts correlation, and adversary behavior mapping
          </p>
        </div>
      </div>

      {/* MITRE Matrix Columns Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {tactics.map(tactic => {
          const items = defaultMitreData.filter(m => m.tactic === tactic);
          return (
            <div
              key={tactic}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 shadow-xs space-y-2.5 flex flex-col hover:shadow-sm transition-all"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate font-mono">
                  {tactic}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 font-mono">
                  {items.length} Techniques
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {items.map(item => (
                  <div
                    key={item.techniqueId}
                    onClick={() => setSelectedTechnique(item)}
                    className={`p-2.5 rounded-lg text-xs transition-all cursor-pointer border shadow-2xs active:scale-[0.98] ${
                      item.activeAlertsCount > 0
                        ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200/80 dark:border-red-800/80 hover:bg-red-100 dark:hover:bg-red-900/40'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {item.techniqueId}
                      </span>
                      {item.activeAlertsCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full font-extrabold text-[9px] font-mono shadow-2xs animate-pulse">
                          {item.activeAlertsCount}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-1.5 line-clamp-1">
                      {item.techniqueName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Technique Details Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">
                  {selectedTechnique.techniqueId} • {selectedTechnique.tactic}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {selectedTechnique.techniqueName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTechnique(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Active Ingested Alerts</div>
                <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1 font-mono">
                  {selectedTechnique.activeAlertsCount} Detected
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Associated Rules</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
                  {selectedTechnique.rulesCount} Rules Active
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedTechnique(null);
                  setActiveNav('alerts');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
              >
                Inspect Alerts for {selectedTechnique.techniqueId}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
