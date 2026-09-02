import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patch, PatchPolicy } from '../../types';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Shield,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

export const PatchManagement: React.FC = () => {
  const {
    patches,
    patchPolicies,
    deploymentJobs,
    deployPatch,
    currentUser,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'policies' | 'deployments'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPatch, setSelectedPatch] = useState<Patch | null>(null);

  // Filter patches
  const filteredPatches = patches.filter(p => {
    if (severityFilter !== 'all' && p.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && p.patchType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.kbOrId.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.cves.some(c => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" /> Pending Approval
          </span>
        );
      case 'Deployed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
            <Check className="w-3 h-3" /> Deployed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            Enterprise Patch Management & Autonomous Automation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-platform OS (Windows, Linux, macOS) & 3rd-party application patching with automated rollbacks and pre-reboot testing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              addToast('Zero-Day Patch Sweep Initiated', 'Evaluating all endpoints against latest CVE and vendor advisory feeds.', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Fleet Patch Assessment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Patch Catalog & Vulnerabilities ({patches.length})
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'policies'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Automated Patch Policies ({patchPolicies.length})
        </button>
        <button
          onClick={() => setActiveTab('deployments')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'deployments'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Active Deployment Jobs ({deploymentJobs.length})
        </button>
      </div>

      {/* TAB 1: Patch Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Security">Security</option>
                <option value="Third-Party">Third-Party App</option>
                <option value="Bug Fix">Bug Fix</option>
                <option value="Feature Update">Feature Update</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search KB, title, CVE, vendor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Patches Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Patch KB / Title</th>
                  <th className="px-4 py-3">Vendor / Product</th>
                  <th className="px-4 py-3">Target Platform</th>
                  <th className="px-4 py-3">CVEs Mitigated</th>
                  <th className="px-4 py-3">Target Endpoints</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatches.map(patch => (
                  <tr
                    key={patch.id}
                    onClick={() => setSelectedPatch(patch)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase border shadow-2xs font-mono ${getSeverityBadgeClass(
                          patch.severity
                        )}`}
                      >
                        {patch.severity}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="font-mono text-blue-600 dark:text-blue-400">{patch.kbOrId}</span>
                        {patch.rebootRequired && (
                          <span className="text-[9px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                            Reboot Req
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{patch.title}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">{patch.vendor}</div>
                      <div className="text-[10px] text-slate-400">{patch.product}</div>
                    </td>

                    <td className="px-4 py-3.5 capitalize font-medium text-slate-600 dark:text-slate-300">
                      {patch.osPlatform}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[10px]">
                      {patch.cves.length > 0 ? (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold shadow-2xs">
                          {patch.cves[0]}
                          {patch.cves.length > 1 && ` +${patch.cves.length - 1}`}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 font-mono">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${(patch.installedEndpointsCount / patch.applicableEndpointsCount) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {patch.installedEndpointsCount}/{patch.applicableEndpointsCount}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">{getStatusBadge(patch.status)}</td>

                    <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => deployPatch(patch.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3 h-3 fill-white" /> Deploy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Patch Policies */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {patchPolicies.map(pol => (
            <div
              key={pol.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{pol.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pol.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {pol.enabled ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Target Group:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pol.targetGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400">Severities:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {pol.severities.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Schedule:</span>{' '}
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{pol.scheduleCron}</span>
                </div>
                <div>
                  <span className="text-slate-400">Maintenance Window:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pol.maintenanceWindowHours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400">Reboot Behavior:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pol.rebootBehavior}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Deployment Jobs */}
      {activeTab === 'deployments' && (
        <div className="space-y-3">
          {deploymentJobs.map(job => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-xs flex items-center justify-between text-xs"
            >
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{job.id}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{job.patchTitle}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Targets: {job.targetCount} Endpoints • Started: {job.startedAt} {job.completedAt && `• Completed: ${job.completedAt}`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-36 text-right space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{job.stage}</span>
                    <span className="font-mono">{job.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${job.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
