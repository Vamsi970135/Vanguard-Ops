import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Endpoint } from '../../types';
import {
  Monitor,
  Server,
  Laptop,
  AlertTriangle,
  Search,
  Shield,
  Filter,
  CheckSquare,
  Square,
  Terminal,
  Wrench,
  ShieldAlert,
  Power,
  RotateCcw,
  Globe,
  Lock,
  Unlock,
  Radio,
  Download,
  Plus,
  Building2,
  Cpu,
  Layers
} from 'lucide-react';
import { EndpointDetailModal } from './EndpointDetailModal';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportEndpointsData, exportToExcel, exportToDocument, exportToJSON } from '../../utils/exportUtils';

export const EndpointInventory: React.FC = () => {
  const {
    endpoints,
    selectedEndpoint,
    setSelectedEndpoint,
    isolateEndpoint,
    unisolateEndpoint,
    triggerScan,
    rebootEndpoint,
    deployPatch,
    currentOrg,
    selectedOrgId,
    setIsAgentInstallModalOpen
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'Server' | 'Workstation' | 'Laptop' | 'Offline' | 'At-Risk' | 'Unmanaged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredEndpoints = endpoints.filter(ep => {
    if (activeFilter === 'Server' && ep.deviceType !== 'Server') return false;
    if (activeFilter === 'Workstation' && ep.deviceType !== 'Workstation') return false;
    if (activeFilter === 'Laptop' && ep.deviceType !== 'Laptop') return false;
    if (activeFilter === 'Offline' && ep.status !== 'Offline') return false;
    if (activeFilter === 'At-Risk' && ep.status !== 'At-Risk' && ep.status !== 'Unhealthy') return false;
    if (activeFilter === 'Unmanaged' && ep.deviceType !== 'Unmanaged') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ep.hostname.toLowerCase().includes(q) ||
        ep.ipAddress.includes(q) ||
        ep.osName.toLowerCase().includes(q) ||
        ep.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEndpoints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEndpoints.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Monitor className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Endpoint Fleet Management (RMM)
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Building2 className="w-3 h-3" />
              Tenant: {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry, hardware/software inventory, remote terminal, agent deployment and security enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="install-agent-primary-btn"
            onClick={() => setIsAgentInstallModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Endpoint / Install Agent</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">Win/Mac/Linux</span>
          </button>

          {/* Batch Operations Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-950/60 px-3 py-2 rounded-xl border border-blue-200/80 dark:border-blue-800/80 shadow-xs animate-in fade-in-50">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 font-mono">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={() => {
                  selectedIds.forEach(id => triggerScan(id, 'full'));
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                Trigger Scan
              </button>
              <button
                onClick={() => {
                  deployPatch('patch-001');
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                Deploy Critical Patches
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${endpoints.length})` },
            { id: 'Server', label: 'Servers' },
            { id: 'Workstation', label: 'Workstations' },
            { id: 'Laptop', label: 'Laptops' },
            { id: 'At-Risk', label: 'At-Risk / Unhealthy' },
            { id: 'Offline', label: 'Offline' },
            { id: 'Unmanaged', label: 'Unmanaged / Shadow' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input and Export Utility */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by hostname, IP, OS, tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700/80 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <ExportDropdown
            label="Export"
            entityName="Endpoints"
            totalCount={endpoints.length}
            filteredCount={selectedIds.length > 0 ? selectedIds.length : filteredEndpoints.length}
            onExportCSV={() => {
              const exportList = selectedIds.length > 0
                ? endpoints.filter(e => selectedIds.includes(e.id))
                : filteredEndpoints;
              exportEndpointsData(
                exportList,
                selectedIds.length > 0 ? `Selected (${selectedIds.length} nodes)` : activeFilter,
                'csv',
                currentOrg.name
              );
            }}
            onExportPDF={() => {
              const exportList = selectedIds.length > 0
                ? endpoints.filter(e => selectedIds.includes(e.id))
                : filteredEndpoints;
              exportEndpointsData(
                exportList,
                selectedIds.length > 0 ? `Selected (${selectedIds.length} nodes)` : activeFilter,
                'pdf',
                currentOrg.name
              );
            }}
            onExportExcel={() => {
              const exportList = selectedIds.length > 0
                ? endpoints.filter(e => selectedIds.includes(e.id))
                : filteredEndpoints;
              const headers = ['Hostname', 'IP Address', 'OS', 'Type', 'Status', 'Risk Score', 'CPU %', 'RAM %', 'Missing Patches', 'Vulnerabilities', 'Assigned User'];
              const rows = exportList.map(e => [
                e.hostname,
                e.ipAddress,
                e.osName,
                e.deviceType,
                e.status,
                e.riskScore,
                `${e.cpuUsage}%`,
                `${e.ramUsage}%`,
                e.missingPatchesCount,
                e.vulnerabilitiesCount,
                e.assignedUser
              ]);
              exportToExcel({
                filename: `vanguard_endpoints_${currentOrg.name.toLowerCase().replace(/\s+/g, '_')}`,
                title: 'Endpoint Inventory & Asset Intelligence',
                subtitle: `Fleet telemetry for ${currentOrg.name}`,
                orgName: currentOrg.name,
                filterApplied: activeFilter,
                headers,
                rows
              });
            }}
            onExportDoc={() => {
              const exportList = selectedIds.length > 0
                ? endpoints.filter(e => selectedIds.includes(e.id))
                : filteredEndpoints;
              const headers = ['Hostname', 'IP Address', 'OS', 'Type', 'Status', 'Risk Score', 'Patches', 'Vulns'];
              const rows = exportList.map(e => [
                e.hostname,
                e.ipAddress,
                e.osName,
                e.deviceType,
                e.status,
                e.riskScore,
                e.missingPatchesCount,
                e.vulnerabilitiesCount
              ]);
              exportToDocument({
                filename: `vanguard_endpoints_report_${currentOrg.name.toLowerCase().replace(/\s+/g, '_')}`,
                title: 'Endpoint Inventory Governance & Compliance Audit',
                subtitle: `Asset inventory for ${currentOrg.name}`,
                orgName: currentOrg.name,
                filterApplied: activeFilter,
                headers,
                rows
              });
            }}
            onExportJSON={() => {
              const exportList = selectedIds.length > 0
                ? endpoints.filter(e => selectedIds.includes(e.id))
                : filteredEndpoints;
              exportToJSON(
                `vanguard_endpoints_${currentOrg.name.toLowerCase().replace(/\s+/g, '_')}`,
                'Endpoint Fleet Telemetry Export',
                currentOrg.name,
                exportList
              );
            }}
          />
        </div>
      </div>

      {/* Endpoints Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                <th className="px-4 py-3 w-8">
                  <button onClick={toggleSelectAll} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    {selectedIds.length === filteredEndpoints.length && filteredEndpoints.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Hostname & IP</th>
                <th className="px-4 py-3">Operating System</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Resource Load</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Missing Patches</th>
                <th className="px-4 py-3">Security Posture</th>
                <th className="px-4 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEndpoints.map(ep => {
                const isSelected = selectedIds.includes(ep.id);
                return (
                  <tr
                    key={ep.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      ep.isIsolated ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(ep.id)} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Hostname & IP */}
                    <td className="px-4 py-3">
                      <div
                        onClick={() => setSelectedEndpoint(ep)}
                        className="cursor-pointer group flex flex-col"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {ep.hostname}
                          </span>
                          {ep.isIsolated && (
                            <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md font-extrabold uppercase animate-pulse font-mono whitespace-nowrap">
                              ISOLATED
                            </span>
                          )}
                          {ep.rebootPending && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold font-mono whitespace-nowrap">
                              Reboot Pending
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                          <span>{ep.ipAddress}</span>
                          {ep.publicIp && (
                            <span className="text-red-500 font-semibold flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5" /> {ep.publicIp}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Operating System */}
                    <td className="px-4 py-3">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {ep.osName}
                      </div>
                      <div className="text-[10px] text-slate-400">{ep.osVersion}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ep.status === 'Online'
                              ? 'bg-emerald-500'
                              : ep.status === 'At-Risk'
                              ? 'bg-red-500 animate-pulse'
                              : ep.status === 'Unhealthy'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {ep.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{ep.lastSeen}</div>
                    </td>

                    {/* Resource Load */}
                    <td className="px-4 py-3">
                      <div className="w-24 space-y-1 text-[10px]">
                        <div className="flex justify-between text-slate-400">
                          <span>CPU</span>
                          <span className="font-mono">{ep.cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${ep.cpuUsage > 75 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${ep.cpuUsage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>RAM</span>
                          <span className="font-mono">{ep.ramUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${ep.ramUsage > 80 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                            style={{ width: `${ep.ramUsage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono shadow-2xs ${
                            ep.riskScore >= 80
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
                              : ep.riskScore >= 50
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {ep.riskScore}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ep.criticality} Asset
                        </div>
                      </div>
                    </td>

                    {/* Missing Patches */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {ep.missingPatchesCount} Missing
                      </div>
                      {ep.criticalPatchesCount > 0 && (
                        <div className="text-[10px] text-red-600 dark:text-red-400 font-bold font-mono">
                          {ep.criticalPatchesCount} Critical Security
                        </div>
                      )}
                    </td>

                    {/* Security Controls */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 text-[10px] font-mono">
                        <span
                          title={`Firewall: ${ep.firewallEnabled ? 'Enabled' : 'Disabled'}`}
                          className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                            ep.firewallEnabled
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                              : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-800/80'
                          }`}
                        >
                          FW
                        </span>
                        <span
                          title={`EDR: ${ep.edrStatus}`}
                          className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                            ep.edrStatus === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80'
                          }`}
                        >
                          EDR
                        </span>
                        <span
                          title={`Disk Encryption: ${ep.diskEncryption ? 'Active' : 'Disabled'}`}
                          className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                            ep.diskEncryption
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80'
                              : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-800/80'
                          }`}
                        >
                          ENC
                        </span>
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEndpoint(ep)}
                          title="Open Endpoint Inspection Console"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        {ep.isIsolated ? (
                          <button
                            onClick={() => unisolateEndpoint(ep.id)}
                            title="Remove Network Isolation"
                            className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => isolateEndpoint(ep.id)}
                            title="Emergency Host Network Isolation"
                            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/80 border border-red-300 dark:border-red-800 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => triggerScan(ep.id, 'full')}
                          title="Trigger Vulnerability & Patch Scan"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Endpoint Detail Drawer Modal */}
      {selectedEndpoint && (
        <EndpointDetailModal
          endpoint={selectedEndpoint}
          onClose={() => setSelectedEndpoint(null)}
        />
      )}
    </div>
  );
};
