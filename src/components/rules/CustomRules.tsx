import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomRule } from '../../types';
import {
  FileCode,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Shield,
  Layers,
  Code2,
  X
} from 'lucide-react';

export const CustomRules: React.FC = () => {
  const { customRules, toggleCustomRule, saveCustomRule, currentUser, addToast } = useApp();

  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<CustomRule['category']>('Endpoint Security');
  const [newRuleSeverity, setNewRuleSeverity] = useState<CustomRule['severity']>('High');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleField, setNewRuleField] = useState('firewallEnabled');
  const [newRuleValue, setNewRuleValue] = useState('false');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: CustomRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      description: newRuleDescription || `Custom detection rule for ${newRuleName}`,
      category: newRuleCategory,
      severity: newRuleSeverity,
      triggerType: 'On Event',
      matchLogic: 'ALL',
      conditions: [
        {
          id: `c-${Date.now()}`,
          category: 'security',
          field: newRuleField,
          operator: 'equals',
          value: newRuleValue
        }
      ],
      actions: [
        {
          id: `a-${Date.now()}`,
          actionType: 'create_alert',
          params: { title: newRuleName, severity: newRuleSeverity }
        }
      ],
      mode: 'Enforced',
      enabled: true,
      matchCount: 0,
      createdBy: currentUser.name,
      lastRun: 'Just now'
    };

    saveCustomRule(newRule);
    setIsCreatingRule(false);
    setNewRuleName('');
    setNewRuleDescription('');
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-500" />
            Custom Security, Vulnerability & Compliance Rules Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define declarative detection conditions, automated alert thresholds, and remediation triggers
          </p>
        </div>

        <button
          onClick={() => setIsCreatingRule(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Detection Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customRules.map(rule => (
          <div
            key={rule.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase font-mono shadow-2xs ${
                      rule.severity === 'Critical'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/80'
                        : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80'
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md uppercase font-mono border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                    {rule.category}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    Mode: {rule.mode}
                  </span>
                </div>

                <button
                  onClick={() => toggleCustomRule(rule.id)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs active:scale-[0.98] ${
                    rule.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-2.5">
                {rule.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rule.description}</p>

              {/* Condition box */}
              <div className="mt-3.5 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto select-text space-y-1 shadow-2xs">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Match Logic ({rule.matchLogic}):</div>
                {rule.conditions.map(c => (
                  <div key={c.id}>
                    {c.category}.{c.field} {c.operator} "{c.value}"
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>Author: {rule.createdBy} • Matches: {rule.matchCount}</span>
              <span>Trigger: {rule.triggerType}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isCreatingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                Create New Custom Rule
              </h3>
              <button onClick={() => setIsCreatingRule(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unquoted Service Path Vulnerability"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of what this rule catches..."
                  value={newRuleDescription}
                  onChange={e => setNewRuleDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newRuleCategory}
                    onChange={e => setNewRuleCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="Endpoint Security">Endpoint Security</option>
                    <option value="Vulnerability">Vulnerability & Risk</option>
                    <option value="Patch">Patch Compliance</option>
                    <option value="Compliance">Compliance Audit</option>
                    <option value="Identity">Identity</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Severity</label>
                  <select
                    value={newRuleSeverity}
                    onChange={e => setNewRuleSeverity(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Condition Field</label>
                  <input
                    type="text"
                    value={newRuleField}
                    onChange={e => setNewRuleField(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Condition Target Value</label>
                  <input
                    type="text"
                    value={newRuleValue}
                    onChange={e => setNewRuleValue(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingRule(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save & Activate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
