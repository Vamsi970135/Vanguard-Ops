import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Sliders,
  Shield,
  Settings,
  Building2,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Globe,
  FileCode,
  Download,
  Eye,
  RotateCcw,
  Plus,
  X,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Lock,
  Terminal,
  Activity,
  Calendar
} from 'lucide-react';
import { ExportDropdown } from '../common/ExportDropdown';
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  exportToDocument,
  exportToJSON
} from '../../utils/exportUtils';

export const ActionHistoryAuditLog: React.FC = () => {
  const {
    auditLogs,
    currentOrg,
    selectedOrgId,
    currentUser,
    recordAuditLog,
    addToast
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // Selected Log for Inspection Drawer
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Manual Audit Simulation Modal
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simCategory, setSimCategory] = useState<'Security Rule' | 'System Setting' | 'Tenant Perimeter' | 'Access & RBAC' | 'Compliance'>('Security Rule');
  const [simAction, setSimAction] = useState('Sigma Detection Rule Threshold Tweaked');
  const [simObject, setSimObject] = useState('Rule: Suspicious LSASS Memory Dump Access (T1003.001)');
  const [simPrevVal, setSimPrevVal] = useState('Alert Threshold: 3 Events in 5m; Action: Alert Only');
  const [simNewVal, setSimNewVal] = useState('Alert Threshold: 1 Event Instant; Action: Isolate Endpoint & Dump RAM');
  const [simSeverity, setSimSeverity] = useState<'Info' | 'Warning' | 'High' | 'Critical'>('High');
  const [simOutcome, setSimOutcome] = useState<'Success' | 'Denied' | 'Failed'>('Success');

  // Filtered Logs Calculation
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'Security Rule' && log.category !== 'Security Rule') return false;
        if (selectedCategory === 'System Setting' && log.category !== 'System Setting') return false;
        if (selectedCategory === 'Tenant Perimeter' && log.category !== 'Tenant Perimeter') return false;
        if (selectedCategory === 'Access & RBAC' && log.category !== 'Access & RBAC') return false;
        if (selectedCategory === 'Compliance' && log.category !== 'Compliance') return false;
      }

      // Outcome filter
      if (selectedOutcome !== 'all' && log.result !== selectedOutcome) return false;

      // Severity filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = log.user.toLowerCase().includes(q) || (log.userEmail && log.userEmail.toLowerCase().includes(q));
        const matchAction = log.action.toLowerCase().includes(q);
        const matchObject = log.object.toLowerCase().includes(q);
        const matchIp = log.ip.toLowerCase().includes(q);
        const matchOrg = log.organization.toLowerCase().includes(q);
        const matchHash = log.signatureHash && log.signatureHash.toLowerCase().includes(q);
        if (!matchUser && !matchAction && !matchObject && !matchIp && !matchOrg && !matchHash) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedCategory, selectedOutcome, selectedSeverity, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = auditLogs.length;
    const secRulesCount = auditLogs.filter(l => l.category === 'Security Rule' || l.action.toLowerCase().includes('rule')).length;
    const sysSettingsCount = auditLogs.filter(l => l.category === 'System Setting' || l.action.toLowerCase().includes('policy') || l.action.toLowerCase().includes('brand') || l.action.toLowerCase().includes('setting')).length;
    const deniedCount = auditLogs.filter(l => l.result === 'Denied' || l.result === 'Failed').length;
    const highCritCount = auditLogs.filter(l => l.severity === 'Critical' || l.severity === 'High').length;

    return {
      total,
      secRulesCount,
      sysSettingsCount,
      deniedCount,
      highCritCount
    };
  }, [auditLogs]);

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    addToast('Checksum Copied', 'Cryptographic SHA-256 audit digest copied to clipboard.', 'info');
    setTimeout(() => setCopiedHashId(null), 2500);
  };

  const handleSimulateAction = (e: React.FormEvent) => {
    e.preventDefault();
    recordAuditLog({
      category: simCategory,
      action: simAction,
      object: simObject,
      previousValue: simPrevVal,
      newValue: simNewVal,
      diffSummary: `~ Config changed by ${currentUser.name}\n- Old: ${simPrevVal}\n+ New: ${simNewVal}`,
      result: simOutcome,
      severity: simSeverity
    });

    setIsSimulateModalOpen(false);
    addToast('Audit Entry Created', `Recorded change event: "${simAction}" under ${simCategory}.`, 'success');
  };

  const handleRollbackAction = (log: AuditLog) => {
    if (!log.previousValue || log.previousValue === 'None' || log.previousValue === 'N/A') {
      addToast('Cannot Rollback', 'No previous state snapshot available for this initial creation event.', 'warning');
      return;
    }

    recordAuditLog({
      category: log.category || 'System Setting',
      action: `Rollback: Reverted "${log.action}"`,
      object: log.object,
      previousValue: log.newValue,
      newValue: log.previousValue,
      diffSummary: `↩️ Automated Rollback performed by ${currentUser.name}\nRestored state to: ${log.previousValue}`,
      result: 'Success',
      severity: 'Warning'
    });

    addToast('Rollback Recorded', `Configuration for "${log.object}" rolled back to prior snapshot.`, 'info');
    setSelectedLog(null);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Audit Trail</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
            {metrics.total} <span className="text-xs text-slate-400 font-sans font-normal">Events</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Tamper Proof
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Security Rule Changes</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {metrics.secRulesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Custom, Sigma & YARA rules
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">System Settings Modified</span>
            <Settings className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
            {metrics.sysSettingsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            MFA, Brand, Webhooks, SLA
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">High & Critical Impact</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl font-extrabold text-orange-600 dark:text-orange-400 font-mono">
            {metrics.highCritCount}
          </div>
          <div className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 font-semibold">
            Elevated governance scrutiny
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Denied / Blocked</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            {metrics.deniedCount}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">
            Unauthorized policy attempts
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Export & Simulation */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-audit-log-input"
              placeholder="Search by action, security rule, setting, user, IP, or hash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 shadow-2xs focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export & Action Simulation */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              id="log-manual-change-btn"
              onClick={() => setIsSimulateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Setting / Rule Change</span>
            </button>

            <ExportDropdown
              label="Export Audit History"
              entityName="Audit Records"
              totalCount={auditLogs.length}
              filteredCount={filteredLogs.length}
              onExportCSV={() => {
                const headers = ['Timestamp', 'Category', 'Action', 'Target Object', 'User', 'IP Address', 'Result', 'Severity', 'SHA-256 Digest'];
                const rows = filteredLogs.map(l => [
                  l.timestamp,
                  l.category || 'System Setting',
                  l.action,
                  l.object,
                  l.user,
                  l.ip,
                  l.result,
                  l.severity || 'Info',
                  l.signatureHash || 'N/A'
                ]);
                exportToCSV({
                  filename: 'vanguard_action_history_audit',
                  title: 'Security Rules & System Settings Action History Audit Log',
                  orgName: currentOrg.name,
                  headers,
                  rows
                });
              }}
              onExportPDF={() => {
                const headers = ['Timestamp', 'Category', 'Action', 'Target Object', 'User', 'Result', 'Severity'];
                const rows = filteredLogs.map(l => [
                  l.timestamp,
                  l.category || 'System Setting',
                  l.action,
                  l.object,
                  l.user,
                  l.result,
                  l.severity || 'Info'
                ]);
                exportToPDF({
                  filename: 'vanguard_action_history_audit',
                  title: 'SOC 2 Type II Compliance Action History Audit Trail',
                  orgName: currentOrg.name,
                  headers,
                  rows
                });
              }}
              onExportExcel={() => {
                const headers = ['ID', 'Timestamp', 'Category', 'Action', 'Target Object', 'User', 'User Email', 'Organization', 'IP Address', 'Previous State', 'New State', 'Result', 'Severity', 'SHA-256 Digest'];
                const rows = filteredLogs.map(l => [
                  l.id,
                  l.timestamp,
                  l.category || 'System Setting',
                  l.action,
                  l.object,
                  l.user,
                  l.userEmail || '',
                  l.organization,
                  l.ip,
                  l.previousValue || '',
                  l.newValue || '',
                  l.result,
                  l.severity || 'Info',
                  l.signatureHash || ''
                ]);
                exportToExcel({
                  filename: 'vanguard_action_history_audit',
                  title: 'Security Rules & System Settings Action History Audit Log',
                  orgName: currentOrg.name,
                  headers,
                  rows
                });
              }}
              onExportDoc={() => {
                const headers = ['Timestamp', 'Category', 'Action', 'Target Object', 'User', 'Result'];
                const rows = filteredLogs.map(l => [
                  l.timestamp,
                  l.category || 'System Setting',
                  l.action,
                  l.object,
                  l.user,
                  l.result
                ]);
                exportToDocument({
                  filename: 'vanguard_action_history_governance_report',
                  title: 'SOC Governance: Security Rules & System Settings Action Audit',
                  orgName: currentOrg.name,
                  headers,
                  rows
                });
              }}
              onExportJSON={() => {
                exportToJSON('vanguard_action_history_audit', 'Security Rules & System Settings Action History Audit Trail', currentOrg.name, filteredLogs);
              }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>

          {[
            { id: 'all', label: 'All Actions', icon: Activity },
            { id: 'Security Rule', label: 'Security Rules', icon: Shield },
            { id: 'System Setting', label: 'System Settings', icon: Settings },
            { id: 'Tenant Perimeter', label: 'Tenant Perimeter', icon: Building2 },
            { id: 'Access & RBAC', label: 'Access & RBAC', icon: KeyRound },
            { id: 'Compliance', label: 'Compliance', icon: FileCheck2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`filter-category-${tab.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer text-[11px] ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Outcome filter */}
          <select
            value={selectedOutcome}
            onChange={e => setSelectedOutcome(e.target.value)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Outcomes</option>
            <option value="Success">🟢 Success</option>
            <option value="Denied">🔴 Denied</option>
            <option value="Failed">⚠️ Failed</option>
          </select>

          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Severities</option>
            <option value="Critical">🔥 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Warning">🟡 Warning</option>
            <option value="Info">ℹ️ Info</option>
          </select>
        </div>
      </div>

      {/* Main Audit Records Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Audit Stream ({filteredLogs.length} Records)
            </h3>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Signed by Vanguard Trust Authority
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No matching action history records found
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search query, category filter, or severity parameters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedOutcome('all');
                setSelectedSeverity('all');
              }}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="px-4 py-3">Timestamp (UTC)</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Action Description</th>
                  <th className="px-4 py-3">Target / Object</th>
                  <th className="px-4 py-3">Actor / Operator</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => {
                  const isSecRule = log.category === 'Security Rule' || log.action.toLowerCase().includes('rule');
                  const isSysSetting = log.category === 'System Setting' || log.action.toLowerCase().includes('setting') || log.action.toLowerCase().includes('policy');

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isSecRule ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200/80 dark:border-indigo-800/80">
                            <Shield className="w-2.5 h-2.5" /> Security Rule
                          </span>
                        ) : isSysSetting ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] border border-cyan-200/80 dark:border-cyan-800/80">
                            <Settings className="w-2.5 h-2.5" /> System Setting
                          </span>
                        ) : log.category === 'Access & RBAC' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200/80 dark:border-purple-800/80">
                            <KeyRound className="w-2.5 h-2.5" /> Access & RBAC
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                            <Building2 className="w-2.5 h-2.5" /> {log.category || 'Tenant Perimeter'}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>{log.action}</span>
                          {log.severity === 'Critical' && (
                            <span className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded text-[9px] font-black uppercase">
                              Critical
                            </span>
                          )}
                          {log.severity === 'High' && (
                            <span className="px-1.5 py-0.2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded text-[9px] font-bold uppercase">
                              High
                            </span>
                          )}
                        </div>
                        {log.diffSummary && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs mt-0.5">
                            {log.diffSummary.split('\n')[0]}
                          </div>
                        )}
                      </td>

                      {/* Target Object */}
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        <span className="font-semibold">{log.object}</span>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {log.user.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{log.user}</div>
                            {log.userEmail && (
                              <div className="text-[10px] text-slate-400 font-mono">{log.userEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ip}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {log.result === 'Success' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Success
                          </span>
                        ) : log.result === 'Denied' ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>

                      {/* View Button */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-all cursor-pointer"
                          title="Inspect Detailed Diff & Verification Hash"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DRAWER: DETAILED AUDIT RECORD INSPECTION & DIFF VIEWER */}
      {/* ------------------------------------------------------------- */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      Audit Event Inspection
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ID: {selectedLog.id}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-5 text-xs">
                {/* Event Overview Card */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {selectedLog.category || 'System Action'}
                      </span>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        {selectedLog.action}
                      </h4>
                    </div>
                    {selectedLog.result === 'Success' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Validated
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {selectedLog.result}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Actor:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{selectedLog.user}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ingress IP:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.ip}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Organization:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{selectedLog.organization}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Timestamp:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.timestamp} UTC</span>
                    </div>
                  </div>
                </div>

                {/* Target Object */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Target Configuration / Rule Object
                  </label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {selectedLog.object}
                  </div>
                </div>

                {/* State Diff Comparison */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Snapshot Diff (Previous State vs. New State)
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Previous State */}
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> State Prior to Modification:
                      </span>
                      <div className="font-mono text-xs text-rose-900 dark:text-rose-300 break-words whitespace-pre-wrap">
                        {selectedLog.previousValue || 'None (Initial Creation)'}
                      </div>
                    </div>

                    {/* New State */}
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" /> Enacted Target State:
                      </span>
                      <div className="font-mono text-xs text-emerald-900 dark:text-emerald-300 break-words whitespace-pre-wrap">
                        {selectedLog.newValue || 'Updated'}
                      </div>
                    </div>
                  </div>

                  {selectedLog.diffSummary && (
                    <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Detailed Diff Transcript:
                      </div>
                      <div className="text-slate-300 whitespace-pre-wrap text-[11px]">
                        {selectedLog.diffSummary}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cryptographic Hash Digest */}
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3" /> SOC 2 Cryptographic Proof
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Algorithm: SHA-256</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                    <code className="font-mono text-[10px] text-slate-300 break-all">
                      {selectedLog.signatureHash || 'sha256:8f4b2c19e34a710287b901fc63a8d9e2114bc501e74a62c9384501a1829e001a'}
                    </code>
                    <button
                      onClick={() => handleCopyHash(selectedLog.signatureHash || 'sha256:8f4b2c19e34a710287b901fc63a8d9e2114bc501e74a62c9384501a1829e001a', selectedLog.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHashId === selectedLog.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This block is chained to the Vanguard SOC tamper-proof audit repository. Changes cannot be altered retroactively.
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                id="rollback-action-btn"
                onClick={() => handleRollbackAction(selectedLog)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Prior State (Rollback)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: MANUAL CHANGE / SIMULATION RECORDER */}
      {/* ------------------------------------------------------------- */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    Record Setting or Rule Change Event
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Manually logs an authenticated administrative reconfiguration into the immutable trail
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateAction} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Category *
                  </label>
                  <select
                    value={simCategory}
                    onChange={e => setSimCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Security Rule">🛡️ Security Rule</option>
                    <option value="System Setting">⚙️ System Setting</option>
                    <option value="Tenant Perimeter">🏢 Tenant Perimeter</option>
                    <option value="Access & RBAC">🔑 Access & RBAC</option>
                    <option value="Compliance">📋 Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={simSeverity}
                    onChange={e => setSimSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Info">ℹ️ Info</option>
                    <option value="Warning">🟡 Warning</option>
                    <option value="High">🟠 High</option>
                    <option value="Critical">🔥 Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Action Title *
                </label>
                <input
                  type="text"
                  required
                  value={simAction}
                  onChange={e => setSimAction(e.target.value)}
                  placeholder="e.g. Custom Detection Rule Threshold Updated"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Object / Rule ID *
                </label>
                <input
                  type="text"
                  required
                  value={simObject}
                  onChange={e => setSimObject(e.target.value)}
                  placeholder="e.g. Rule: PowerShell Obfuscation Detection (Rule-901)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous State / Value
                  </label>
                  <textarea
                    rows={2}
                    value={simPrevVal}
                    onChange={e => setSimPrevVal(e.target.value)}
                    placeholder="Old threshold or settings"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Enacted Value
                  </label>
                  <textarea
                    rows={2}
                    value={simNewVal}
                    onChange={e => setSimNewVal(e.target.value)}
                    placeholder="New threshold or settings"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-manual-audit-btn"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Sign & Commit Audit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
