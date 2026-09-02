import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportSchedule, ReportExecutionLog } from '../../types';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  Shield,
  Clock,
  Printer,
  Plus,
  Play,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FileSpreadsheet,
  BookOpen,
  FileCode,
  Building2,
  Send,
  Sparkles,
  Check,
  X,
  Mail,
  AlertTriangle
} from 'lucide-react';
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  exportToDocument,
  exportToJSON
} from '../../utils/exportUtils';

export const ReportsView: React.FC = () => {
  const {
    currentOrg,
    selectedOrgId,
    organizations,
    endpoints,
    patches,
    vulnerabilities,
    alerts,
    incidents,
    reportSchedules,
    reportLogs,
    addReportSchedule,
    deleteReportSchedule,
    toggleReportSchedule,
    triggerReportNow,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'on_demand' | 'schedules' | 'history'>('on_demand');
  const [selectedReportType, setSelectedReportType] = useState<'executive' | 'patch_sla' | 'nist' | 'cisa' | 'inventory' | 'soc_alerts'>('executive');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // New Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleType, setNewScheduleType] = useState<ReportSchedule['reportType']>('Executive Summary');
  const [newScheduleFormat, setNewScheduleFormat] = useState<ReportSchedule['format']>('PDF');
  const [newScheduleFrequency, setNewScheduleFrequency] = useState<ReportSchedule['frequency']>('Weekly');
  const [newScheduleRecipients, setNewScheduleRecipients] = useState('ciso@company.com, secops-team@company.com');
  const [newScheduleOrg, setNewScheduleOrg] = useState(selectedOrgId === 'all' ? 'all' : selectedOrgId);

  // Report Type Definitions
  const reportTemplates = [
    {
      id: 'executive',
      title: 'Executive Cybersecurity Summary',
      typeLabel: 'Executive Summary',
      desc: 'High-level risk score, fleet health, patch status, and threat posture for C-level & Board of Directors.',
      badge: 'CISO / Board',
      category: 'Governance'
    },
    {
      id: 'patch_sla',
      title: 'Patch Management & SLA Audit',
      typeLabel: 'Patch Management SLA',
      desc: 'Tracks adherence against 14-day SLA for Critical & High OS/Third-party patches across all endpoints.',
      badge: 'IT & SecOps',
      category: 'Patching'
    },
    {
      id: 'nist',
      title: 'NIST CSF 2.0 Security Assessment',
      typeLabel: 'NIST CSF 2.0 Assessment',
      desc: 'Identify, Protect, Detect, Respond, and Recover control maturity benchmarks with NIST mappings.',
      badge: 'Compliance',
      category: 'Audit'
    },
    {
      id: 'cisa',
      title: 'CISA KEV Zero-Day Exposure',
      typeLabel: 'CISA KEV Zero-Day',
      desc: 'Federal timeline compliance for actively exploited CVE catalog and prioritized remediation queue.',
      badge: 'Threat Intel',
      category: 'Vulnerabilities'
    },
    {
      id: 'inventory',
      title: 'Fleet Hardware & Software Inventory',
      typeLabel: 'Fleet Inventory',
      desc: 'Authoritative catalog of all managed endpoints, OS versions, hardware specs, and agent telemetry.',
      badge: 'RMM Operations',
      category: 'Assets'
    },
    {
      id: 'soc_alerts',
      title: 'SOC Detections & Incident Triage',
      typeLabel: 'SOC Alerts & Incident Triage',
      desc: 'SIEM alert ingestion summary, MITRE ATT&CK technique matrix, and active incident response cases.',
      badge: 'SOC Telemetry',
      category: 'Incident Response'
    }
  ];

  // Helper to compile data depending on selected report type
  const getReportDataset = () => {
    switch (selectedReportType) {
      case 'inventory': {
        const headers = ['Hostname', 'IP Address', 'OS', 'Device Type', 'Status', 'Risk Score', 'Agent Version', 'Assigned User'];
        const rows = endpoints.map(e => [
          e.hostname,
          e.ipAddress,
          e.osName,
          e.deviceType,
          e.status,
          e.riskScore,
          e.agentVersion,
          e.assignedUser
        ]);
        return {
          title: 'Fleet Hardware & Software Asset Inventory',
          subtitle: `Telemetry from ${endpoints.length} managed nodes in ${currentOrg.name}`,
          headers,
          rows,
          raw: endpoints
        };
      }
      case 'patch_sla': {
        const headers = ['Patch ID', 'Title', 'Severity', 'Category', 'Release Date', 'Status', 'Compliance %', 'Target Endpoints'];
        const rows = patches.map(p => [
          p.kbOrId,
          p.title,
          p.severity,
          p.category,
          p.releaseDate,
          p.status,
          `${p.compliancePercentage}%`,
          p.applicableEndpointsCount
        ]);
        return {
          title: 'Patch Management & SLA Adherence Audit',
          subtitle: `Enterprise patch compliance across ${patches.length} updates for ${currentOrg.name}`,
          headers,
          rows,
          raw: patches
        };
      }
      case 'cisa':
      case 'nist': {
        const headers = ['CVE ID', 'Severity', 'CVSS Score', 'EPSS Score', 'CISA KEV', 'Exploit Available', 'Title', 'Remediation Status'];
        const rows = vulnerabilities.map(v => [
          v.cve,
          v.severity,
          v.cvssScore,
          `${(v.epssScore * 100).toFixed(1)}%`,
          v.isCisaKev ? 'YES (Active)' : 'No',
          v.hasExploitAvailable ? 'YES (Public)' : 'No',
          v.title,
          v.remediationStatus
        ]);
        return {
          title: selectedReportType === 'cisa' ? 'CISA KEV Zero-Day Vulnerability Exposure' : 'NIST CSF 2.0 Vulnerability Benchmark',
          subtitle: `Analysis of ${vulnerabilities.length} threat vectors across ${currentOrg.name}`,
          headers,
          rows,
          raw: vulnerabilities
        };
      }
      case 'soc_alerts': {
        const headers = ['Alert ID', 'Severity', 'Title', 'Hostname', 'MITRE ATT&CK', 'Rule', 'Status', 'Timestamp'];
        const rows = alerts.map(a => [
          a.id,
          a.severity,
          a.title,
          a.hostname,
          `${a.mitreId} (${a.mitreTactic})`,
          a.detectionRule,
          a.status,
          a.timestamp
        ]);
        return {
          title: 'SOC Alerts & Threat Triage Audit',
          subtitle: `Event telemetry across ${alerts.length} ingested security alerts for ${currentOrg.name}`,
          headers,
          rows,
          raw: alerts
        };
      }
      case 'executive':
      default: {
        const headers = ['Metric Category', 'Measured Value', 'Baseline Target', 'Compliance Status', 'Operational Notes'];
        const rows = [
          ['Total Managed Endpoints', `${endpoints.length} Active Nodes`, '100% Enrollment', 'Optimal', 'Agent telemetry streaming reliably'],
          ['Fleet Risk Score Index', `${currentOrg.riskScore} / 100`, '< 30.0 Target', currentOrg.riskScore < 30 ? 'Compliant' : 'Elevated Risk', 'Continuous vulnerability posture assessment'],
          ['Critical Patch SLA (14-Day)', `${patches.filter(p => p.status === 'Deployed').length} / ${patches.length} Patches`, '95% Threshold', 'Compliant', 'No overdue emergency zero-day updates'],
          ['Active SOC Alerts', `${alerts.filter(a => a.status === 'New' || a.status === 'Investigating').length} Alerts`, '< 10 Pending', 'Managed', 'Triage pipeline operating at nominal speed'],
          ['Open Incidents', `${incidents.filter(i => i.status !== 'Resolved').length} Cases`, 'Zero Critical', 'Contained', 'All cases assigned to Tier 2 SOC investigators'],
          ['EDR / Antivirus Coverage', '98.8%', '95.0% Minimum', 'Compliant', 'Real-time telemetry and behavior inspection active']
        ];
        return {
          title: 'Executive Cybersecurity & Endpoint Posture Summary',
          subtitle: `CISO & Board-level governance audit for ${currentOrg.name}`,
          headers,
          rows,
          raw: {
            organization: currentOrg.name,
            endpointCount: endpoints.length,
            riskScore: currentOrg.riskScore,
            patchesCount: patches.length,
            alertsCount: alerts.length,
            incidentsCount: incidents.length
          }
        };
      }
    }
  };

  // Generate & Download Multi-Format Report
  const handleExportFormat = (format: 'PDF' | 'DOC' | 'EXCEL' | 'CSV' | 'JSON') => {
    setIsGenerating(format);
    const data = getReportDataset();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `vanguard_${selectedReportType}_${currentOrg.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${dateStr}`;

    try {
      if (format === 'PDF') {
        exportToPDF({
          filename,
          title: data.title,
          subtitle: data.subtitle,
          orgName: currentOrg.name,
          headers: data.headers,
          rows: data.rows.map(r => r.map(c => String(c ?? ''))),
          severityColumnIndex: 1
        });
      } else if (format === 'EXCEL') {
        exportToExcel({
          filename,
          title: data.title,
          subtitle: data.subtitle,
          orgName: currentOrg.name,
          headers: data.headers,
          rows: data.rows
        });
      } else if (format === 'DOC') {
        exportToDocument({
          filename,
          title: data.title,
          subtitle: data.subtitle,
          orgName: currentOrg.name,
          headers: data.headers,
          rows: data.rows
        });
      } else if (format === 'CSV') {
        exportToCSV({
          filename,
          title: data.title,
          orgName: currentOrg.name,
          headers: data.headers,
          rows: data.rows
        });
      } else if (format === 'JSON') {
        exportToJSON(filename, data.title, currentOrg.name, data.raw);
      }

      // Log execution
      triggerReportNow(
        reportTemplates.find(t => t.id === selectedReportType)?.typeLabel || 'Executive Summary',
        format,
        undefined
      );
    } catch (err) {
      addToast('Export Error', `Failed to generate ${format} report.`, 'error');
    } finally {
      setTimeout(() => setIsGenerating(null), 600);
    }
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleName.trim()) {
      addToast('Validation Error', 'Schedule name is required', 'error');
      return;
    }

    const recipients = newScheduleRecipients.split(',').map(r => r.trim()).filter(Boolean);

    addReportSchedule({
      name: newScheduleName.trim(),
      reportType: newScheduleType,
      format: newScheduleFormat,
      frequency: newScheduleFrequency,
      timeOfDay: '08:00 AM UTC',
      recipients: recipients.length > 0 ? recipients : ['ciso@company.com'],
      organizationId: newScheduleOrg,
      organizationName: newScheduleOrg === 'all' ? 'All Organizations (MSP)' : (organizations.find(o => o.id === newScheduleOrg)?.name || currentOrg.name),
      status: 'Active'
    });

    setIsScheduleModalOpen(false);
    setNewScheduleName('');
    setActiveTab('schedules');
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Executive Reports & Automated Compliance Engine
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Building2 className="w-3 h-3" />
              Tenant: {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate multi-format compliance documents (PDF, Word, Excel, CSV, JSON) and configure automated recurring delivery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="schedule-report-btn"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Automated Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 gap-6">
        <button
          id="tab-on-demand"
          onClick={() => setActiveTab('on_demand')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'on_demand'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>On-Demand Report Generator</span>
        </button>

        <button
          id="tab-schedules"
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'schedules'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Automated Delivery Schedules ({reportSchedules.length})</span>
        </button>

        <button
          id="tab-history"
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Execution History & Delivery Logs ({reportLogs.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ON-DEMAND REPORT GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'on_demand' && (
        <div className="space-y-6">
          {/* Multi-Format Export Action Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Export Selected Report in Any Format</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono px-2 py-0.2 rounded-full font-bold">
                  {reportTemplates.find(t => t.id === selectedReportType)?.title}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Instant generation with dynamic telemetry, metadata classification, and compliance styling
              </div>
            </div>

            {/* Format Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="export-btn-pdf"
                onClick={() => handleExportFormat('PDF')}
                disabled={isGenerating !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>{isGenerating === 'PDF' ? 'Generating...' : 'PDF Report'}</span>
                <span className="text-[9px] bg-rose-200/70 dark:bg-rose-900 px-1 rounded font-mono">.PDF</span>
              </button>

              <button
                id="export-btn-doc"
                onClick={() => handleExportFormat('DOC')}
                disabled={isGenerating !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isGenerating === 'DOC' ? 'Compiling...' : 'Document (Word)'}</span>
                <span className="text-[9px] bg-indigo-200/70 dark:bg-indigo-900 px-1 rounded font-mono">.DOC</span>
              </button>

              <button
                id="export-btn-excel"
                onClick={() => handleExportFormat('EXCEL')}
                disabled={isGenerating !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isGenerating === 'EXCEL' ? 'Exporting...' : 'Excel Workbook'}</span>
                <span className="text-[9px] bg-emerald-200/70 dark:bg-emerald-900 px-1 rounded font-mono">.XLS</span>
              </button>

              <button
                id="export-btn-csv"
                onClick={() => handleExportFormat('CSV')}
                disabled={isGenerating !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>{isGenerating === 'CSV' ? 'Exporting...' : 'CSV'}</span>
                <span className="text-[9px] bg-teal-200/70 dark:bg-teal-900 px-1 rounded font-mono">.CSV</span>
              </button>

              <button
                id="export-btn-json"
                onClick={() => handleExportFormat('JSON')}
                disabled={isGenerating !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-600" />
                <span>{isGenerating === 'JSON' ? 'Dumping...' : 'JSON'}</span>
                <span className="text-[9px] bg-amber-200/70 dark:bg-amber-900 px-1 rounded font-mono">.JSON</span>
              </button>
            </div>
          </div>

          {/* Template Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTemplates.map(rpt => {
              const isSelected = selectedReportType === rpt.id;
              return (
                <div
                  key={rpt.id}
                  onClick={() => setSelectedReportType(rpt.id as any)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {rpt.category}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {rpt.badge}
                    </span>
                  </div>

                  <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                    {rpt.title}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {rpt.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Document Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 shadow-xs space-y-6 max-w-4xl mx-auto">
            {/* Header Banner */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div>
                <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
                  Vanguard Ops • Autonomous SecOps Audit
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                  {reportTemplates.find(t => t.id === selectedReportType)?.title}
                </h3>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Tenant: <span className="font-bold text-slate-700 dark:text-slate-200">{currentOrg.name}</span> • Generated {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Compliance Status</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">89.4%</div>
                <span className="text-[10px] text-slate-400 font-mono">SOC 2 / ISO 27001 Benchmark</span>
              </div>
            </div>

            {/* Dynamic Content Grid based on selection */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Telemetry & Compliance Telemetry Dataset
              </h4>

              {/* Table Preview */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                      {getReportDataset().headers.slice(0, 5).map((h, i) => (
                        <th key={i} className="px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {getReportDataset().rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-mono text-[11px]">
                        {row.slice(0, 5).map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                Showing preview of first 5 rows • Full export includes all {getReportDataset().rows.length} records.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: AUTOMATED DELIVERY SCHEDULES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Automated recurring report dispatch to CISOs, compliance auditors, and ticketing pipelines.
            </p>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Schedule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportSchedules.map(schedule => {
              const isActive = schedule.status === 'Active';

              return (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{schedule.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full font-mono ${
                          isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {schedule.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Type: <span className="font-bold text-slate-700 dark:text-slate-300">{schedule.reportType}</span> • Format: <span className="font-bold text-blue-600 font-mono">{schedule.format}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleReportSchedule(schedule.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={isActive ? 'Pause Schedule' : 'Activate Schedule'}
                      >
                        {isActive ? <ToggleRight className="w-6 h-6 text-blue-600" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button
                        onClick={() => deleteReportSchedule(schedule.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Frequency:
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{schedule.frequency} ({schedule.timeOfDay})</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Target Tenant:
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{schedule.organizationName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Recipients:
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        {schedule.recipients.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Next Run: <strong className="text-slate-600 dark:text-slate-300">{schedule.nextRun}</strong>
                    </span>

                    <button
                      onClick={() => triggerReportNow(schedule.id, schedule.reportType, (schedule.formats?.[0] || 'PDF'))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run Now & Dispatch</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: EXECUTION HISTORY & DELIVERY LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Audit record of all scheduled runs, on-demand exports, and compliance distributions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="px-4 py-3">Report Name</th>
                  <th className="px-4 py-3">Tenant Scope</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-xs">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                      <div>{log.scheduleName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{log.reportType}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.organizationName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                        {log.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{log.generatedAt}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{(log.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleExportFormat(log.format as any)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors cursor-pointer"
                        title={`Re-download ${log.format}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SCHEDULE AUTOMATED REPORT */}
      {/* ------------------------------------------------------------- */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    Schedule Automated Report Generation
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure recurring delivery to executive & audit distribution pipelines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Title *
                </label>
                <input
                  type="text"
                  required
                  value={newScheduleName}
                  onChange={e => setNewScheduleName(e.target.value)}
                  placeholder="e.g. Weekly CISO Executive SecOps Audit"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Report Type
                  </label>
                  <select
                    value={newScheduleType}
                    onChange={e => setNewScheduleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Executive Summary">Executive Cybersecurity Summary</option>
                    <option value="Patch Management SLA">Patch Management & SLA Audit</option>
                    <option value="NIST CSF 2.0 Assessment">NIST CSF 2.0 Benchmark</option>
                    <option value="CISA KEV Zero-Day">CISA KEV Zero-Day Audit</option>
                    <option value="Fleet Inventory">Fleet Hardware & Software Inventory</option>
                    <option value="SOC Alerts & Incident Triage">SOC Alerts & Incident Triage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Export Output Format
                  </label>
                  <select
                    value={newScheduleFormat}
                    onChange={e => setNewScheduleFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500 font-mono"
                  >
                    <option value="PDF">PDF (.pdf - Executive Report)</option>
                    <option value="DOC">Document (.doc - Editable Word)</option>
                    <option value="EXCEL">Excel (.xls - Styled Workbook)</option>
                    <option value="CSV">CSV (.csv - Tabular Data)</option>
                    <option value="JSON">JSON (.json - SIEM API Payload)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cadence / Frequency
                  </label>
                  <select
                    value={newScheduleFrequency}
                    onChange={e => setNewScheduleFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Daily">Daily (Every 24 Hours)</option>
                    <option value="Weekly">Weekly (Every Monday Morning)</option>
                    <option value="Monthly">Monthly (1st of Each Month)</option>
                    <option value="On SLA Breach">Trigger on SLA Breach (Automated)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tenant Organization Scope
                  </label>
                  <select
                    value={newScheduleOrg}
                    onChange={e => setNewScheduleOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Organizations (MSP Multi-Tenant)</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Distribution List (Comma-separated emails)
                </label>
                <input
                  type="text"
                  required
                  value={newScheduleRecipients}
                  onChange={e => setNewScheduleRecipients(e.target.value)}
                  placeholder="ciso@company.com, audit@company.com, soc@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save & Enable Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
