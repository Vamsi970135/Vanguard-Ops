import React, { useState } from 'react';
import { Endpoint, SoftwarePackage, SystemProcess, SystemService, NetworkPort } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Monitor,
  Cpu,
  HardDrive,
  Shield,
  ShieldAlert,
  Wrench,
  Activity,
  Terminal,
  Server,
  Lock,
  Unlock,
  RotateCcw,
  Power,
  Play,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
  FileCode
} from 'lucide-react';

interface Props {
  endpoint: Endpoint;
  onClose: () => void;
}

export const EndpointDetailModal: React.FC<Props> = ({ endpoint, onClose }) => {
  const {
    isolateEndpoint,
    unisolateEndpoint,
    triggerScan,
    rebootEndpoint,
    deployPatch,
    executeRemoteCommand,
    patches,
    vulnerabilities,
    securityEvents
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'hardware' | 'software' | 'patches' | 'vulns' | 'events' | 'processes' | 'services' | 'network' | 'terminal'
  >('overview');

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    { type: 'output', text: `Vanguard Remote Management Agent CLI v4.8.2 [Connected to ${endpoint.hostname}]` },
    { type: 'output', text: `Type 'help' for diagnostic commands or execute native PowerShell / Bash syntax.` }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);

  // Mock installed software
  const mockSoftware: SoftwarePackage[] = [
    { id: 'sw-1', name: 'Microsoft SQL Server 2022', vendor: 'Microsoft', version: '16.0.4125.1', installDate: '2024-01-15', sizeMb: 3200, hasVulnerability: true, vulnerabilityCve: 'CVE-2024-38077' },
    { id: 'sw-2', name: 'Google Chrome', vendor: 'Google LLC', version: '126.0.6478.127 (Outdated)', installDate: '2024-06-01', sizeMb: 320, hasVulnerability: true, vulnerabilityCve: 'CVE-2024-7255' },
    { id: 'sw-3', name: 'CrowdStrike Falcon Sensor', vendor: 'CrowdStrike', version: '7.15.18409.0', installDate: '2024-02-10', sizeMb: 145, hasVulnerability: false },
    { id: 'sw-4', name: 'OpenSSL for Windows', vendor: 'OpenSSL Project', version: '3.0.12 (Vulnerable)', installDate: '2023-11-20', sizeMb: 45, hasVulnerability: true, vulnerabilityCve: 'CVE-2024-5535' },
    { id: 'sw-5', name: 'Vanguard Agent Daemon', vendor: 'Vanguard Security', version: '4.8.2-prod', installDate: '2024-08-01', sizeMb: 68, hasVulnerability: false }
  ];

  // Mock Processes
  const [processes, setProcesses] = useState<SystemProcess[]>([
    { pid: 4, name: 'System', user: 'NT AUTHORITY\\SYSTEM', cpuPercent: 0.2, memPercent: 0.5, commandLine: 'C:\\Windows\\System32\\ntoskrnl.exe' },
    { pid: 912, name: 'vanguard_agent.exe', user: 'NT AUTHORITY\\SYSTEM', cpuPercent: 0.8, memPercent: 1.2, commandLine: 'C:\\Program Files\\Vanguard\\agent.exe -daemon' },
    { pid: 1420, name: 'sqlservr.exe', user: 'svc_mssql_prod', cpuPercent: 14.5, memPercent: 34.2, commandLine: 'C:\\Program Files\\Microsoft SQL Server\\MSSQL16.MSSQLSERVER\\sqlservr.exe' },
    { pid: 3840, name: 'w3wp.exe', user: 'IIS APPPOOL\\DefaultAppPool', cpuPercent: 4.2, memPercent: 6.8, commandLine: 'C:\\Windows\\System32\\inetsrv\\w3wp.exe -ap DefaultAppPool' },
    { pid: 5120, name: 'powershell.exe', user: 'NT AUTHORITY\\SYSTEM', cpuPercent: 18.4, memPercent: 4.1, commandLine: 'powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc JABjAGwAYQ...', isSuspicious: true }
  ]);

  // Mock Services
  const [services, setServices] = useState<SystemService[]>([
    { name: 'MSSQLSERVER', displayName: 'SQL Server (MSSQLSERVER)', status: 'Running', startupType: 'Automatic' },
    { name: 'TermService', displayName: 'Remote Desktop Services', status: 'Running', startupType: 'Automatic' },
    { name: 'VanguardAgentSvc', displayName: 'Vanguard Endpoint Security Agent', status: 'Running', startupType: 'Automatic' },
    { name: 'W3SVC', displayName: 'World Wide Web Publishing Service', status: 'Running', startupType: 'Automatic' },
    { name: 'WinDefend', displayName: 'Microsoft Defender Antivirus Service', status: 'Running', startupType: 'Automatic' }
  ]);

  // Mock Network Ports
  const networkPorts: NetworkPort[] = [
    { port: 1433, protocol: 'TCP', state: 'Listening', service: 'MSSQL', process: 'sqlservr.exe (PID 1420)', isExposed: false },
    { port: 3389, protocol: 'TCP', state: 'Listening', service: 'RDP / Terminal Services', process: 'svchost.exe (PID 1204)', isExposed: true },
    { port: 4444, protocol: 'TCP', state: 'Established', service: 'Cobalt Strike C2 Beacon', process: 'powershell.exe (PID 5120)', isExposed: true },
    { port: 8080, protocol: 'TCP', state: 'Listening', service: 'Agent Management TLS', process: 'vanguard_agent.exe (PID 912)', isExposed: false }
  ];

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isExecutingCmd) return;

    const cmd = terminalInput;
    setTerminalHistory(prev => [...prev, { type: 'input', text: cmd }]);
    setTerminalInput('');
    setIsExecutingCmd(true);

    if (cmd.trim() === 'clear') {
      setTerminalHistory([]);
      setIsExecutingCmd(false);
      return;
    }

    const output = await executeRemoteCommand(endpoint.id, cmd);
    setTerminalHistory(prev => [...prev, { type: 'output', text: output }]);
    setIsExecutingCmd(false);
  };

  const handleStopProcess = (pid: number) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setTerminalHistory(prev => [
      ...prev,
      { type: 'output', text: `[ACTION] Process termination signal sent for PID ${pid}. Process killed.` }
    ]);
  };

  const handleRestartService = (name: string) => {
    setServices(prev =>
      prev.map(s => (s.name === name ? { ...s, status: 'Running' } : s))
    );
  };

  const epEvents = securityEvents.filter(e => e.endpointId === endpoint.id || e.hostname === endpoint.hostname);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 select-none animate-in fade-in-50">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/80 dark:border-blue-800/80 shadow-2xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {endpoint.hostname}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono shadow-2xs ${
                    endpoint.status === 'Online'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : endpoint.status === 'At-Risk'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {endpoint.status}
                </span>
                {endpoint.isIsolated && (
                  <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md font-extrabold uppercase animate-pulse shadow-2xs font-mono">
                    NETWORK QUARANTINED
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-3 mt-0.5">
                <span>IP: {endpoint.ipAddress}</span>
                <span>OS: {endpoint.osName}</span>
                <span>Agent: {endpoint.agentVersion}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {endpoint.isIsolated ? (
              <button
                onClick={() => unisolateEndpoint(endpoint.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Remove Isolation</span>
              </button>
            ) : (
              <button
                onClick={() => isolateEndpoint(endpoint.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Isolate Host</span>
              </button>
            )}

            <button
              onClick={() => triggerScan(endpoint.id, 'full')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Trigger Scan</span>
            </button>

            <button
              onClick={() => rebootEndpoint(endpoint.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Power className="w-3.5 h-3.5 text-amber-500" />
              <span>Reboot</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Isolation Alert Banner */}
        {endpoint.isIsolated && (
          <div className="bg-red-600 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>
                Host is actively isolated from corporate LAN/WAN. Only Vanguard Agent TLS telemetry is permitted.
              </span>
            </div>
            <button
              onClick={() => unisolateEndpoint(endpoint.id)}
              className="underline text-white font-extrabold hover:text-red-100 cursor-pointer"
            >
              Release Quarantine
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="px-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'hardware', label: 'Hardware Specs' },
            { id: 'software', label: `Software (${mockSoftware.length})` },
            { id: 'patches', label: `Patches (${endpoint.missingPatchesCount})` },
            { id: 'vulns', label: `Vulnerabilities (${endpoint.vulnerabilitiesCount})` },
            { id: 'processes', label: `Processes (${processes.length})` },
            { id: 'services', label: `Services (${services.length})` },
            { id: 'network', label: 'Network & Ports' },
            { id: 'events', label: `Security Events (${epEvents.length})` },
            { id: 'terminal', label: 'Remote Terminal' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950">
          {/* 1. Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Calculated Risk Score</div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 font-mono">
                    {endpoint.riskScore} <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="text-xs text-red-500 font-semibold mt-1">
                    Critical Asset • {endpoint.criticalVulnsCount} Zero-Days Detected
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Missing Patches</div>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 font-mono">
                    {endpoint.missingPatchesCount}
                  </div>
                  <div className="text-xs text-orange-500 font-semibold mt-1">
                    {endpoint.criticalPatchesCount} Critical Security Updates
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Perimeter Exposure</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
                    {endpoint.isInternetFacing ? (
                      <span className="text-red-600 flex items-center gap-1">
                        <Globe className="w-4 h-4" /> Internet Facing (DMZ)
                      </span>
                    ) : (
                      <span className="text-emerald-600">Internal Subnet</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Public IP: {endpoint.publicIp || 'None'}
                  </div>
                </div>
              </div>

              {/* Security Controls Status Grid */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Local Endpoint Security Controls
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Firewall</div>
                    <div className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (Domain)
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">EDR Sensor</div>
                    <div className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> CrowdStrike Active
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Disk Encryption</div>
                    <div className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> BitLocker XTS-256
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Secure Boot</div>
                    <div className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> UEFI Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  Asset Classification Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {endpoint.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Hardware Specs */}
          {activeTab === 'hardware' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Hardware Inventory & Motherboard Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Processor (CPU)</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{endpoint.cpuModel}</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">Current Usage: {endpoint.cpuUsage}%</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Physical Memory (RAM)</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{endpoint.ramTotalGb} GB DDR4 ECC</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">Current Usage: {endpoint.ramUsage}%</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Storage Volumes</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{endpoint.diskTotalGb} GB NVMe SSD Array</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">Volume C:\ ({endpoint.diskUsage}% Full)</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Network Adapters</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Intel I210 Gigabit Adapter</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">MAC: {endpoint.macAddress}</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Software */}
          {activeTab === 'software' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                    <th className="px-4 py-3">Software Package</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">Vulnerability Status</th>
                    <th className="px-4 py-3 text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockSoftware.map(sw => (
                    <tr key={sw.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{sw.name}</td>
                      <td className="px-4 py-3 text-slate-500">{sw.vendor}</td>
                      <td className="px-4 py-3 font-mono">{sw.version}</td>
                      <td className="px-4 py-3">
                        {sw.hasVulnerability ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md font-bold text-[10px] font-mono border border-red-200 dark:border-red-800 shadow-2xs">
                            <ShieldAlert className="w-3 h-3" /> {sw.vulnerabilityCve}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Up to date
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono">{sw.sizeMb} MB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Patches */}
          {activeTab === 'patches' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Missing OS & Third-Party Patches ({endpoint.missingPatchesCount})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Action1-compatible silent background deployment engine</p>
                </div>
                <button
                  onClick={() => deployPatch('patch-001', endpoint.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                >
                  Deploy All Missing Updates
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                      <th className="px-4 py-3">KB / Patch ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Reboot Req.</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patches.slice(0, 3).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{p.kbOrId}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{p.title}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-[10px] font-mono border border-red-200 dark:border-red-800 shadow-2xs">
                            {p.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{p.rebootRequired ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deployPatch(p.id, endpoint.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                          >
                            Install Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Vulnerabilities */}
          {activeTab === 'vulns' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                    <th className="px-4 py-3">CVE Identifier</th>
                    <th className="px-4 py-3">Title & Summary</th>
                    <th className="px-4 py-3">CVSS / EPSS</th>
                    <th className="px-4 py-3">CISA KEV</th>
                    <th className="px-4 py-3 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vulnerabilities.slice(0, 4).map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-red-600 dark:text-red-400">{v.cve}</td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{v.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{v.description}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-red-600 dark:text-red-400">{v.cvssScore} CVSS</div>
                        <div className="text-[10px] text-slate-400">EPSS: {(v.epssScore * 100).toFixed(1)}%</div>
                      </td>
                      <td className="px-4 py-3">
                        {v.isCisaKev ? (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-md font-bold text-[9px] uppercase border border-amber-200 dark:border-amber-800 shadow-2xs font-mono">
                            Active In Wild
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-red-600 dark:text-red-400 font-mono">{v.calculatedRiskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. Processes */}
          {activeTab === 'processes' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                    <th className="px-4 py-3">PID</th>
                    <th className="px-4 py-3">Process Name</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">CPU / Mem</th>
                    <th className="px-4 py-3">Command Line</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {processes.map(proc => (
                    <tr
                      key={proc.pid}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        proc.isSuspicious ? 'bg-red-50/50 dark:bg-red-950/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-slate-500">{proc.pid}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        {proc.name}
                        {proc.isSuspicious && (
                          <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md font-extrabold uppercase shadow-2xs font-mono">
                            SUSPICIOUS
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{proc.user}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {proc.cpuPercent}% / {proc.memPercent}%
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                        {proc.commandLine}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleStopProcess(proc.pid)}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                        >
                          Kill Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. Services */}
          {activeTab === 'services' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Display Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Startup Type</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {services.map(svc => (
                    <tr key={svc.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{svc.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{svc.displayName}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {svc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{svc.startupType}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRestartService(svc.name)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                        >
                          Restart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 8. Network & Ports */}
          {activeTab === 'network' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200/80 dark:border-slate-800/80">
                    <th className="px-4 py-3">Port</th>
                    <th className="px-4 py-3">Proto / State</th>
                    <th className="px-4 py-3">Service / Description</th>
                    <th className="px-4 py-3">Associated Process</th>
                    <th className="px-4 py-3 text-right">Perimeter Exposure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {networkPorts.map((p, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        p.port === 4444 ? 'bg-red-50/60 dark:bg-red-950/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{p.port}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {p.protocol} / {p.state}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                        {p.service}
                        {p.port === 4444 && (
                          <span className="ml-2 text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-md font-extrabold uppercase shadow-2xs font-mono">
                            ALERT
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.process}</td>
                      <td className="px-4 py-3 text-right">
                        {p.isExposed ? (
                          <span className="text-red-500 font-bold text-[10px] uppercase font-mono">
                            Public Ingress
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Internal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 9. Security Events */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {epEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No anomalous security events logged for this host in the last 24 hours.
                </div>
              ) : (
                epEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase font-mono shadow-2xs ${
                            evt.severity === 'Critical'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                          }`}
                        >
                          {evt.severity}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{evt.eventType}</span>
                        <span className="text-slate-400 text-[10px]">Source: {evt.source}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{evt.message}</div>
                    {evt.commandLine && (
                      <div className="mt-2 p-2.5 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto border border-slate-800">
                        {evt.commandLine}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 10. Remote Terminal */}
          {activeTab === 'terminal' && (
            <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs flex flex-col h-96 border border-slate-800 shadow-inner">
              <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 select-text">
                {terminalHistory.map((item, idx) => (
                  <div key={idx}>
                    {item.type === 'input' ? (
                      <div className="text-blue-400 font-bold flex items-center gap-2">
                        <span className="text-slate-500">C:\Vanguard\Agent&gt;</span>
                        <span>{item.text}</span>
                      </div>
                    ) : (
                      <div className="text-slate-300 whitespace-pre-wrap leading-relaxed pl-2 border-l border-slate-800">
                        {item.text}
                      </div>
                    )}
                  </div>
                ))}
                {isExecutingCmd && (
                  <div className="text-yellow-400 italic">Sending command payload to endpoint daemon...</div>
                )}
              </div>

              {/* Terminal Input Box */}
              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-slate-800 pt-2.5">
                <span className="text-blue-400 font-bold">&gt;</span>
                <input
                  type="text"
                  placeholder="Type 'help', 'whoami', 'ipconfig', 'netstat', 'patch check', 'isolate'..."
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-emerald-400 focus:outline-hidden text-xs font-mono placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={isExecutingCmd || !terminalInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 shadow-2xs active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                >
                  Execute
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
