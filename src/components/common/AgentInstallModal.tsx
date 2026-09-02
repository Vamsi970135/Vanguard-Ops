import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Monitor,
  Terminal,
  Copy,
  Check,
  Download,
  Shield,
  Layers,
  X,
  Apple,
  Cpu,
  Building2,
  Key,
  ExternalLink,
  Zap,
  CheckCircle2,
  Radio,
  FileCode,
  HardDrive
} from 'lucide-react';

export const AgentInstallModal: React.FC = () => {
  const {
    isAgentInstallModalOpen,
    setIsAgentInstallModalOpen,
    currentOrg,
    selectedOrgId,
    organizations,
    endpoints,
    addToast
  } = useApp();

  const [selectedOS, setSelectedOS] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [selectedOrgKey, setSelectedOrgKey] = useState(selectedOrgId === 'all' ? organizations[0]?.id || 'org-acme' : selectedOrgId);
  const [installMethod, setInstallMethod] = useState<'cli' | 'package' | 'mdm'>('cli');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [customTags, setCustomTags] = useState('production, soc-monitored, edr-vanguard');
  const [enableAutoPatch, setEnableAutoPatch] = useState(true);

  if (!isAgentInstallModalOpen) return null;

  const targetOrg = organizations.find(o => o.id === selectedOrgKey) || currentOrg;
  const tenantApiKey = `vng_${targetOrg.id.replace('org-', '')}_live_${targetOrg.id.split('-')[1] || 'sec'}8923a1f4b8`;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    addToast('Copied to Clipboard', `Command copied for ${selectedOS.toUpperCase()} agent deployment.`, 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Windows Commands
  const windowsPowerShellCmd = `# Vanguard Autonomous Agent Deployment (Windows 10/11/Server 2016-2025)
$TenantKey = "${tenantApiKey}"
$TenantId = "${targetOrg.id}"
$Tags = "${customTags}"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
irm https://cdn.vanguardops.io/agent/win/install.ps1 | iex -ArgumentList "-ApiKey $TenantKey -TenantId $TenantId -Tags '$Tags' -AutoPatch ${enableAutoPatch}"`;

  const windowsMsiCmd = `msiexec.exe /i "vanguard-agent-v3.4.2-x64.msi" /qn /norestart TENANT_KEY="${tenantApiKey}" TENANT_ID="${targetOrg.id}" TAGS="${customTags}" AUTO_PATCH=${enableAutoPatch ? 1 : 0}`;

  // Linux Commands
  const linuxCurlCmd = `# Vanguard Linux Telemetry & EDR Sensor (Ubuntu/Debian/RHEL/CentOS/Rocky/Amazon Linux)
curl -fsSL https://cdn.vanguardops.io/agent/linux/install.sh | sudo bash -s -- \\
  --tenant-key "${tenantApiKey}" \\
  --tenant-id "${targetOrg.id}" \\
  --tags "${customTags}" \\
  --enable-autopatch ${enableAutoPatch}`;

  const linuxAptCmd = `# Vanguard APT Repository (Debian / Ubuntu 20.04/22.04/24.04 LTS)
curl -fsSL https://packages.vanguardops.io/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/vanguard.gpg
echo "deb [signed-by=/etc/apt/keyrings/vanguard.gpg] https://packages.vanguardops.io/deb stable main" | sudo tee /etc/apt/sources.list.d/vanguard.list
sudo apt update && sudo apt install -y vanguard-agent
sudo vanguard-cli enroll --key "${tenantApiKey}" --tenant "${targetOrg.id}" --tags "${customTags}"`;

  const linuxRpmCmd = `# Vanguard YUM/DNF Repository (RHEL 8/9, CentOS, Rocky Linux, Fedora)
sudo dnf install -y https://packages.vanguardops.io/rpm/vanguard-release.rpm
sudo dnf install -y vanguard-agent
sudo vanguard-cli enroll --key "${tenantApiKey}" --tenant "${targetOrg.id}" --tags "${customTags}"`;

  // macOS Commands
  const macCurlCmd = `# Vanguard macOS Unified Agent (macOS 12 Monterey, 13 Ventura, 14 Sonoma, 15 Sequoia - Apple Silicon & Intel)
curl -fsSL https://cdn.vanguardops.io/agent/macos/install.sh | sudo zsh -s -- \\
  --tenant-key "${tenantApiKey}" \\
  --tenant-id "${targetOrg.id}" \\
  --tags "${customTags}"`;

  const macPkgCmd = `sudo /usr/sbin/installer -pkg "VanguardAgent-v3.4.2.pkg" -target /
sudo /Applications/VanguardAgent.app/Contents/MacOS/vanguard-cli enroll \\
  --key "${tenantApiKey}" \\
  --tenant "${targetOrg.id}" \\
  --tags "${customTags}"`;

  const handleSimulateEnrollment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      addToast(
        'Agent Enrolled Successfully',
        `New endpoint enrolled into tenant "${targetOrg.name}". Telemetry stream active.`,
        'success'
      );
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-800 dark:text-slate-100 tracking-tight">
                  Add Endpoints / Install Vanguard Agent
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono border border-blue-200 dark:border-blue-800">
                  v3.4.2 Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cross-platform sensor for continuous asset inventory, real-time RMM telemetry, and EDR threat defense
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAgentInstallModalOpen(false);
              setVerifiedSuccess(false);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Target Tenant Organization Bar */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Enrollment Tenant Scope:</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedOrgKey}
                onChange={e => setSelectedOrgKey(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-2xs focus:ring-2 focus:ring-blue-500"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>
                    🏢 {o.name} ({o.endpointCount} nodes)
                  </option>
                ))}
              </select>

              <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
                ID: {targetOrg.id}
              </div>
            </div>
          </div>

          {/* OS Selector Tabs */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedOS('windows')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                selectedOS === 'windows'
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <div className="font-black text-xs text-slate-800 dark:text-slate-100">Microsoft Windows</div>
                <div className="text-[10px] text-slate-400">10, 11, Server 2016-2025 (x64/ARM)</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOS('linux')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                selectedOS === 'linux'
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center">
                <div className="font-black text-xs text-slate-800 dark:text-slate-100">Linux Distributions</div>
                <div className="text-[10px] text-slate-400">Ubuntu, Debian, RHEL, CentOS, Rocky</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOS('macos')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                selectedOS === 'macos'
                  ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Apple className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="text-center">
                <div className="font-black text-xs text-slate-800 dark:text-slate-100">Apple macOS</div>
                <div className="text-[10px] text-slate-400">Monterey, Ventura, Sonoma, Sequoia</div>
              </div>
            </button>
          </div>

          {/* Deployment Method Options */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setInstallMethod('cli')}
                className={`pb-1 font-bold transition-all cursor-pointer ${
                  installMethod === 'cli'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                1-Line Silent Command (CLI)
              </button>
              <button
                onClick={() => setInstallMethod('package')}
                className={`pb-1 font-bold transition-all cursor-pointer ${
                  installMethod === 'package'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Installer Package (MSI / DEB / PKG)
              </button>
              <button
                onClick={() => setInstallMethod('mdm')}
                className={`pb-1 font-bold transition-all cursor-pointer ${
                  installMethod === 'mdm'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Enterprise MDM / GPO / Intune
              </button>
            </div>
          </div>

          {/* Configuration Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Asset Metadata Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={customTags}
                onChange={e => setCustomTags(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                placeholder="production, web-tier, pci-dss"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAutoPatch}
                  onChange={e => setEnableAutoPatch(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Enable Automated Patch Management
                </span>
              </label>
            </div>
          </div>

          {/* CODE / COMMAND DISPLAY BLOCKS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {selectedOS === 'windows' && 'Windows PowerShell Execution Script'}
                {selectedOS === 'linux' && 'Linux Bash Quick-Install Command'}
                {selectedOS === 'macos' && 'macOS Terminal Execution Script'}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Tenant Key: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{tenantApiKey.substring(0, 14)}...</code>
                </span>
              </div>
            </div>

            {/* WINDOWS */}
            {selectedOS === 'windows' && (
              <div className="relative group">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                  {installMethod === 'package' ? windowsMsiCmd : windowsPowerShellCmd}
                </pre>
                <button
                  onClick={() => copyToClipboard(installMethod === 'package' ? windowsMsiCmd : windowsPowerShellCmd, 'win')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {copiedKey === 'win' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'win' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
            )}

            {/* LINUX */}
            {selectedOS === 'linux' && (
              <div className="space-y-2">
                <div className="relative group">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                    {installMethod === 'package' ? linuxAptCmd : linuxCurlCmd}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(installMethod === 'package' ? linuxAptCmd : linuxCurlCmd, 'linux')}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedKey === 'linux' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'linux' ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>

                {installMethod === 'package' && (
                  <div className="relative group">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">RHEL / CentOS Alternative (RPM)</div>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                      {linuxRpmCmd}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* MACOS */}
            {selectedOS === 'macos' && (
              <div className="relative group">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                  {installMethod === 'package' ? macPkgCmd : macCurlCmd}
                </pre>
                <button
                  onClick={() => copyToClipboard(installMethod === 'package' ? macPkgCmd : macCurlCmd, 'mac')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {copiedKey === 'mac' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'mac' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Test & Verification Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-transparent border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                  Agent Telemetry Handshake Listener
                </div>
                <div className="text-[11px] text-slate-400">
                  Verify real-time enrollment connection for tenant: <strong className="text-slate-700 dark:text-slate-300">{targetOrg.name}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {verifiedSuccess ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrolled & Online</span>
                </span>
              ) : (
                <button
                  onClick={handleSimulateEnrollment}
                  disabled={isVerifying}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Radio className="w-3.5 h-3.5" />
                  )}
                  <span>{isVerifying ? 'Listening for Heartbeat...' : 'Verify Agent Heartbeat'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Encrypted with TLS 1.3 + SHA-256 Mutual Agent Authentication</span>
          </div>

          <button
            onClick={() => {
              setIsAgentInstallModalOpen(false);
              setVerifiedSuccess(false);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
