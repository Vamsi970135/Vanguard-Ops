import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SOCIncident } from '../../types';
import {
  Flame,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Send,
  Lock,
  ArrowRight,
  FileText,
  AlertTriangle,
  Radio
} from 'lucide-react';

export const IncidentResponse: React.FC = () => {
  const {
    incidents,
    selectedIncident,
    setSelectedIncident,
    updateIncidentStatus,
    addIncidentNote,
    currentUser,
    isolateEndpoint,
    endpoints
  } = useApp();

  const [newNoteText, setNewNoteText] = useState('');
  const [activeIncidentId, setActiveIncidentId] = useState<string>(incidents[0]?.id || '');

  const currentIncident = incidents.find(i => i.id === activeIncidentId) || incidents[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentIncident) return;

    addIncidentNote(currentIncident.id, newNoteText);
    setNewNoteText('');
  };

  if (!currentIncident) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400">
        No active incidents logged.
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            SOC Incident Response War Room & Case Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time containment orchestration, forensic timeline tracking, evidence locker, and analyst notes
          </p>
        </div>

        {/* Incident Selector Pill list */}
        <div className="flex items-center gap-2">
          {incidents.map(inc => (
            <button
              key={inc.id}
              onClick={() => setActiveIncidentId(inc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98] ${
                inc.id === currentIncident.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{inc.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Incident Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Briefing & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Banner Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-200/80 dark:border-orange-900/80 shadow-2xs">
                    {currentIncident.id}
                  </span>
                  <span className="text-[10px] font-extrabold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md uppercase font-mono border border-red-200 dark:border-red-800 shadow-2xs">
                    {currentIncident.severity} Priority
                  </span>
                  <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800/80 shadow-2xs font-mono">
                    Status: {currentIncident.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-2">
                  {currentIncident.title}
                </h3>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2">
                <select
                  value={currentIncident.status}
                  onChange={e => updateIncidentStatus(currentIncident.id, e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Triage">Triage</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Containment">Containment</option>
                  <option value="Eradication">Eradication</option>
                  <option value="Recovery">Recovery</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentIncident.summary}
            </p>

            {/* Incident Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Lead Analyst</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{currentIncident.assignedAnalyst}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Affected Nodes</div>
                <div className="font-bold text-red-600 dark:text-red-400 mt-0.5 truncate font-mono">{currentIncident.affectedAssets.join(', ')}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Correlated Alerts</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{currentIncident.alertIds.length} Alerts</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Created Time</div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{currentIncident.createdAt}</div>
              </div>
            </div>
          </div>

          {/* Timeline Reconstruction */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Chronological Kill-Chain Timeline
            </h4>

            <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {currentIncident.timeline.map((step, idx) => (
                <div key={idx} className="relative group">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute -left-6 top-1 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{step.time}</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {step.action}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5 font-mono">
                    Actor / Source: {step.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Containment Checklist & Case Notes */}
        <div className="space-y-6">
          {/* Containment Checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" /> Immediate Containment Tasks
            </h4>

            <div className="space-y-2 text-xs">
              {currentIncident.remediationTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-colors shadow-2xs ${
                    task.done
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="font-semibold text-xs">{task.task}</span>
                  <span className="text-[10px] font-bold uppercase font-mono">
                    {task.done ? 'Done' : task.requiredRole}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Case Notes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-3 flex flex-col h-[400px]">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Analyst Case Notes ({currentIncident.notes.length})
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {currentIncident.notes.map(note => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{note.author}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{note.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Add investigation note or forensic artifact..."
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg px-3 py-2 text-xs border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
