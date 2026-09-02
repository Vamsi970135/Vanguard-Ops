import React from 'react';
import { useApp } from '../../context/AppContext';
import { GitFork, Play, Plus, Zap, CheckCircle2, Shield, Bell, ArrowRight } from 'lucide-react';

export const AutomationWorkflows: React.FC = () => {
  const { workflows, addToast } = useApp();

  const handleTestRun = (name: string) => {
    addToast(
      'SOAR Playbook Executed',
      `Manual test run triggered for "${name}". All action steps verified successfully.`,
      'success'
    );
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-500" />
            Automation & Security Orchestration (SOAR) Playbooks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated containment, auto-patching of zero-days, Slack/Teams notifications, and SIEM enrichment pipelines
          </p>
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflows.map(wf => (
          <div
            key={wf.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{wf.name}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Trigger: {wf.trigger}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 rounded-full uppercase font-mono shadow-2xs">
                  {wf.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {wf.description}
              </p>

              {/* Action Steps Flow */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Automated Action Chain ({wf.steps.length} steps)
                </div>
                <div className="space-y-1.5">
                  {wf.steps.map((step, i) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800 font-mono">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{step.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{step.detail}</div>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 rounded-md font-mono shrink-0">
                        {step.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                Trigger count: <span className="font-bold text-slate-700 dark:text-slate-200">{wf.executionCount}</span> • Last: {wf.lastExecuted}
              </span>
              <button
                onClick={() => handleTestRun(wf.name)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Test Run</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
