import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Endpoint, SOCAlert, Vulnerability } from '../types';

interface CSVExportOptions {
  filename: string;
  title: string;
  filterApplied?: string;
  orgName?: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Downloads a well-formatted RFC-4180 CSV file with metadata header
 */
export const exportToCSV = ({
  filename,
  title,
  filterApplied,
  orgName = 'Vanguard Enterprise SOC',
  headers,
  rows
}: CSVExportOptions): void => {
  const timestamp = new Date().toISOString();
  
  // Format CSV lines
  const csvLines: string[] = [];
  
  // Metadata preamble
  csvLines.push(`"# REPORT: ${title}"`);
  csvLines.push(`"# ORGANIZATION: ${orgName}"`);
  csvLines.push(`"# GENERATED: ${timestamp}"`);
  if (filterApplied) {
    csvLines.push(`"# ACTIVE FILTERS: ${filterApplied}"`);
  }
  csvLines.push(`"# TOTAL RECORDS: ${rows.length}"`);
  csvLines.push(''); // blank separator
  
  // Header row
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  csvLines.push(headers.map(escapeCell).join(','));

  // Data rows
  rows.forEach(row => {
    csvLines.push(row.map(escapeCell).join(','));
  });

  const csvContent = csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  filterApplied?: string;
  orgName?: string;
  headers: string[];
  rows: (string | number)[][];
  severityColumnIndex?: number;
}

/**
 * Generates an executive, styled SOC PDF report using jsPDF and autoTable
 */
export const exportToPDF = ({
  filename,
  title,
  subtitle = 'Security Telemetry & Compliance Export',
  filterApplied,
  orgName = 'Vanguard Enterprise SOC',
  headers,
  rows,
  severityColumnIndex
}: PDFExportOptions): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const accentColor: [number, number, number] = [37, 99, 235]; // Blue 600
  const timestamp = new Date().toLocaleString();

  // Top Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 842, 50, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VANGUARD OPS', 30, 28);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('|  Autonomous RMM & SecOps Platform', 170, 28);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Organization: ${orgName}`, 620, 22);
  doc.text(`Exported: ${timestamp}`, 620, 36);

  // Sub-header section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 30, 75);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(subtitle, 30, 90);

  // Filter Pill Box
  if (filterApplied) {
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.roundedRect(30, 100, 782, 22, 4, 4, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Active Filter Criteria: `, 40, 114);
    doc.setFont('helvetica', 'normal');
    doc.text(`${filterApplied}  |  Total Matching Records: ${rows.length}`, 135, 114);
  }

  const startY = filterApplied ? 132 : 108;

  // AutoTable
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 4.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Color-code severity badges if column matches
      if (severityColumnIndex !== undefined && data.section === 'body' && data.column.index === severityColumnIndex) {
        const val = String(data.cell.raw).toUpperCase();
        if (val.includes('CRITICAL')) {
          data.cell.styles.textColor = [185, 28, 28]; // Red 700
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('HIGH')) {
          data.cell.styles.textColor = [194, 65, 12]; // Orange 700
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('MEDIUM')) {
          data.cell.styles.textColor = [161, 98, 7]; // Amber 700
        } else if (val.includes('LOW')) {
          data.cell.styles.textColor = [29, 78, 216]; // Blue 700
        }
      }
    },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageCurrent = (doc as any).internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `CONFIDENTIAL • Vanguard Ops Security Intelligence • Page ${pageCurrent} of ${pageCount}`,
        30,
        575
      );
      doc.text(
        `Generated by ${orgName} Authorized SOC Analyst`,
        650,
        575
      );
    },
    margin: { left: 30, right: 30, top: 40, bottom: 40 }
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

// ==========================================
// SPECIFIC ENDPOINT EXPORTS
// ==========================================

export const exportEndpointsData = (
  endpoints: Endpoint[],
  filterName: string,
  format: 'csv' | 'pdf',
  orgName = 'Vanguard Enterprise'
) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `vanguard_endpoints_${filterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${dateStr}`;

  const headers = [
    'Hostname',
    'Device Type',
    'IP Address',
    'OS & Build',
    'Status',
    'Risk Score',
    'Missing Patches',
    'Isolation',
    'AV Status',
    'EDR Agent',
    'Firewall',
    'CPU %',
    'RAM %',
    'Tags',
    'Last Seen'
  ];

  const rows = endpoints.map(ep => [
    ep.hostname,
    ep.deviceType,
    ep.ipAddress,
    `${ep.osName} ${ep.osVersion}`,
    ep.status,
    ep.riskScore,
    ep.missingPatchesCount,
    ep.isIsolated ? 'ISOLATED' : 'Normal',
    ep.antivirusStatus,
    ep.edrStatus,
    ep.firewallEnabled ? 'Enabled' : 'Disabled',
    `${ep.cpuUsage}%`,
    `${ep.ramUsage}%`,
    ep.tags.join('; '),
    ep.lastSeen
  ]);

  if (format === 'csv') {
    exportToCSV({
      filename,
      title: 'Endpoint Fleet Inventory & RMM State Report',
      filterApplied: `Device Filter: ${filterName}`,
      orgName,
      headers,
      rows
    });
  } else {
    // PDF format with tailored columns for A4 landscape fitting
    const pdfHeaders = [
      'Hostname',
      'Type',
      'IP Address',
      'OS Platform',
      'Status',
      'Risk',
      'Patches',
      'EDR Agent',
      'Firewall',
      'Last Seen'
    ];

    const pdfRows = endpoints.map(ep => [
      ep.hostname + (ep.isIsolated ? ' [ISOLATED]' : ''),
      ep.deviceType,
      ep.ipAddress,
      ep.osName.length > 18 ? ep.osName.substring(0, 18) + '...' : ep.osName,
      ep.status,
      `${ep.riskScore}/100`,
      ep.missingPatchesCount,
      ep.edrStatus,
      ep.firewallEnabled ? 'ON' : 'OFF',
      ep.lastSeen
    ]);

    exportToPDF({
      filename,
      title: 'Endpoint Fleet Inventory & RMM Health Report',
      subtitle: `Comprehensive hardware, OS versioning, patch deficits, and security posture across ${endpoints.length} endpoints.`,
      filterApplied: `View Filter: ${filterName}`,
      orgName,
      headers: pdfHeaders,
      rows: pdfRows,
      severityColumnIndex: 4
    });
  }
};

// ==========================================
// SPECIFIC ALERT EXPORTS
// ==========================================

export const exportAlertsData = (
  alerts: SOCAlert[],
  filterSummary: string,
  format: 'csv' | 'pdf',
  orgName = 'Vanguard Enterprise'
) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `vanguard_soc_alerts_${dateStr}`;

  const headers = [
    'Alert ID',
    'Severity',
    'Alert Title',
    'Hostname',
    'IP Address',
    'Detection Rule',
    'MITRE ID',
    'MITRE Tactic',
    'MITRE Technique',
    'Status',
    'Assigned Analyst',
    'Affected User',
    'Timestamp'
  ];

  const rows = alerts.map(a => [
    a.id,
    a.severity,
    a.title,
    a.hostname,
    a.ipAddress,
    a.detectionRule,
    a.mitreId,
    a.mitreTactic,
    a.mitreTechnique,
    a.status,
    a.assignedAnalyst || 'Unassigned',
    a.user || 'System',
    a.timestamp
  ]);

  if (format === 'csv') {
    exportToCSV({
      filename,
      title: 'SOC & SIEM Security Alerts Triage Export',
      filterApplied: filterSummary,
      orgName,
      headers,
      rows
    });
  } else {
    const pdfHeaders = [
      'Alert ID',
      'Severity',
      'Alert Title / Rule',
      'Hostname & IP',
      'MITRE ATT&CK',
      'Status',
      'Assigned',
      'Timestamp'
    ];

    const pdfRows = alerts.map(a => [
      a.id,
      a.severity,
      `${a.title}\n[Rule: ${a.detectionRule}]`,
      `${a.hostname}\n${a.ipAddress}`,
      `${a.mitreId} (${a.mitreTactic})`,
      a.status,
      a.assignedAnalyst || 'Unassigned',
      a.timestamp
    ]);

    exportToPDF({
      filename,
      title: 'SOC Incident & Threat Alerts Investigation Report',
      subtitle: `Triage telemetry, MITRE ATT&CK mappings, and EDR detections across ${alerts.length} ingested security alerts.`,
      filterApplied: filterSummary,
      orgName,
      headers: pdfHeaders,
      rows: pdfRows,
      severityColumnIndex: 1
    });
  }
};

// ==========================================
// SPECIFIC VULNERABILITY EXPORTS
// ==========================================

export const exportVulnerabilitiesData = (
  vulns: Vulnerability[],
  filterSummary: string,
  format: 'csv' | 'pdf',
  orgName = 'Vanguard Enterprise'
) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `vanguard_cve_vulnerabilities_${dateStr}`;

  const headers = [
    'CVE ID',
    'Severity',
    'CVSS v3.1',
    'EPSS Score',
    'CISA KEV',
    'Exploit Available',
    'Title',
    'Affected Software',
    'Affected Nodes',
    'Remediation Status',
    'Fixed Version'
  ];

  const rows = vulns.map(v => [
    v.cve,
    v.severity,
    v.cvssScore,
    `${(v.epssScore * 100).toFixed(1)}%`,
    v.isCisaKev ? 'YES (Active Exploitation)' : 'No',
    v.hasExploitAvailable ? 'YES (Public PoC)' : 'No',
    v.title,
    v.affectedSoftware,
    v.affectedEndpointsCount,
    v.remediationStatus,
    v.fixedVersion || 'N/A'
  ]);

  if (format === 'csv') {
    exportToCSV({
      filename,
      title: 'CVE Vulnerabilities & Threat Exposure Assessment',
      filterApplied: filterSummary,
      orgName,
      headers,
      rows
    });
  } else {
    const pdfHeaders = [
      'CVE ID',
      'Severity',
      'CVSS',
      'EPSS',
      'CISA KEV',
      'Title / Affected Software',
      'Nodes',
      'Status'
    ];

    const pdfRows = vulns.map(v => [
      v.cve,
      v.severity,
      String(v.cvssScore),
      `${(v.epssScore * 100).toFixed(1)}%`,
      v.isCisaKev ? 'YES [KEV]' : 'No',
      `${v.title.length > 35 ? v.title.substring(0, 35) + '...' : v.title}\n[${v.affectedSoftware}]`,
      String(v.affectedEndpointsCount),
      v.remediationStatus
    ]);

    exportToPDF({
      filename,
      title: 'Enterprise Vulnerability Risk & Remediation Exposure',
      subtitle: `ConnectSecure multi-vector risk ranking across ${vulns.length} identified CVE threats.`,
      filterApplied: filterSummary,
      orgName,
      headers: pdfHeaders,
      rows: pdfRows,
      severityColumnIndex: 1
    });
  }
};

// ==========================================
// EXCEL (.XLS / XML Spreadsheet) EXPORT
// ==========================================

export interface ExcelExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  orgName?: string;
  filterApplied?: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

export const exportToExcel = ({
  filename,
  title,
  subtitle,
  orgName = 'Vanguard Enterprise',
  filterApplied,
  headers,
  rows
}: ExcelExportOptions): void => {
  const timestamp = new Date().toLocaleString();

  // Generate Excel-compatible XML HTML table spreadsheet
  const escapeXml = (unsafe: any) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Security Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; }
        .title { font-size: 16pt; font-weight: bold; color: #0f172a; }
        .subtitle { font-size: 11pt; color: #475569; }
        .meta-label { font-weight: bold; background-color: #f1f5f9; color: #334155; }
        .header-cell { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #cbd5e1; }
        .data-cell { padding: 6px; border: 1px solid #e2e8f0; }
        .data-cell-even { background-color: #f8fafc; }
        .badge-critical { color: #dc2626; font-weight: bold; }
        .badge-high { color: #ea580c; font-weight: bold; }
        .badge-medium { color: #d97706; font-weight: bold; }
        .badge-low { color: #2563eb; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="${headers.length}" class="title">VANGUARD OPS — ${escapeXml(title)}</td>
        </tr>
        <tr>
          <td colspan="${headers.length}" class="subtitle">${escapeXml(subtitle || 'Autonomous RMM & SecOps Compliance Report')}</td>
        </tr>
        <tr>
          <td class="meta-label">Tenant Organization:</td>
          <td colspan="${Math.max(1, headers.length - 1)}">${escapeXml(orgName)}</td>
        </tr>
        <tr>
          <td class="meta-label">Export Timestamp:</td>
          <td colspan="${Math.max(1, headers.length - 1)}">${escapeXml(timestamp)}</td>
        </tr>
        ${filterApplied ? `
        <tr>
          <td class="meta-label">Active Filters:</td>
          <td colspan="${Math.max(1, headers.length - 1)}">${escapeXml(filterApplied)}</td>
        </tr>` : ''}
        <tr>
          <td class="meta-label">Total Record Count:</td>
          <td colspan="${Math.max(1, headers.length - 1)}">${rows.length}</td>
        </tr>
        <tr></tr>
        <tr>
          ${headers.map(h => `<th class="header-cell">${escapeXml(h)}</th>`).join('')}
        </tr>
        ${rows.map((row, idx) => `
          <tr class="${idx % 2 === 0 ? 'data-cell-even' : ''}">
            ${row.map(cell => `<td class="data-cell">${escapeXml(cell)}</td>`).join('')}
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==========================================
// DOCUMENT (.DOC / MS WORD FORMAT) EXPORT
// ==========================================

export interface DocumentExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  orgName?: string;
  executiveSummary?: string;
  classification?: string;
  filterApplied?: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
  recommendations?: string[];
}

export const exportToDocument = ({
  filename,
  title,
  subtitle,
  orgName = 'Vanguard Enterprise',
  executiveSummary,
  classification = 'CONFIDENTIAL // SOC 2 & NIST CSF COMPLIANCE',
  filterApplied,
  headers,
  rows,
  recommendations
}: DocumentExportOptions): void => {
  const timestamp = new Date().toLocaleString();

  const escapeXml = (unsafe: any) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const defaultSummary = `This executive security document provides an authoritative audit of endpoint asset posture, vulnerability threat exposure, and patch compliance across ${orgName}. Generated by the Vanguard Autonomous SecOps Platform, this document reflects real-time telemetry from active EDR sensors and patch orchestrators.`;

  const defaultRecs = recommendations || [
    'Enforce zero-day patch installation for all endpoints with CVSS ≥ 9.0 within 72 hours.',
    'Isolate or upgrade legacy unmanaged nodes identified in the network probe perimeter.',
    'Enable automated reboot windows for high-criticality servers with pending OS kernel updates.'
  ];

  const docHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${escapeXml(title)}</title>
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1in 1in 1in 1in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
        }
        body {
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
        }
        .header-banner {
          background-color: #0f172a;
          color: #ffffff;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
        }
        .classification {
          font-size: 9pt;
          font-weight: bold;
          letter-spacing: 1.5px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        h1 {
          font-size: 20pt;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .subhead {
          font-size: 11pt;
          color: #cbd5e1;
          margin: 0;
        }
        .meta-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 24px;
        }
        .meta-grid {
          display: table;
          width: 100%;
        }
        .meta-row {
          display: table-row;
        }
        .meta-label {
          display: table-cell;
          font-weight: bold;
          color: #475569;
          width: 28%;
          padding: 3px 0;
        }
        .meta-val {
          display: table-cell;
          color: #0f172a;
          padding: 3px 0;
        }
        h2 {
          font-size: 14pt;
          color: #0f172a;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 4px;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        p {
          margin-bottom: 12px;
          text-align: justify;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          margin-bottom: 24px;
          font-size: 9.5pt;
        }
        table.data-table th {
          background-color: #1e293b;
          color: #ffffff;
          font-weight: bold;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #0f172a;
        }
        table.data-table td {
          padding: 7px 10px;
          border: 1px solid #cbd5e1;
          vertical-align: top;
        }
        table.data-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .rec-box {
          background-color: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 12px 16px;
          margin-top: 16px;
          border-radius: 0 6px 6px 0;
        }
        .rec-item {
          margin-bottom: 6px;
        }
        .signoff-section {
          margin-top: 36px;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }
        .sig-block {
          display: inline-block;
          width: 45%;
          margin-right: 5%;
          vertical-align: top;
        }
        .sig-line {
          border-bottom: 1px solid #64748b;
          height: 35px;
          margin-bottom: 6px;
        }
      </style>
    </head>
    <body>
      <div class="header-banner">
        <div class="classification">${escapeXml(classification)}</div>
        <h1>${escapeXml(title)}</h1>
        <div class="subhead">${escapeXml(subtitle || 'Vanguard Autonomous SecOps & RMM Platform')}</div>
      </div>

      <div class="meta-box">
        <div class="meta-grid">
          <div class="meta-row">
            <div class="meta-label">Tenant Organization:</div>
            <div class="meta-val"><strong>${escapeXml(orgName)}</strong></div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Generated Timestamp:</div>
            <div class="meta-val">${escapeXml(timestamp)}</div>
          </div>
          ${filterApplied ? `
          <div class="meta-row">
            <div class="meta-label">Filter Applied:</div>
            <div class="meta-val">${escapeXml(filterApplied)}</div>
          </div>` : ''}
          <div class="meta-row">
            <div class="meta-label">Audit Dataset Size:</div>
            <div class="meta-val">${rows.length} records analyzed</div>
          </div>
        </div>
      </div>

      <h2>1. Executive Summary & Context</h2>
      <p>${escapeXml(executiveSummary || defaultSummary)}</p>

      <h2>2. Telemetry & Governance Dataset</h2>
      <p>The following table contains the detailed audit records extracted from active sensors and security policy analyzers.</p>
      
      <table class="data-table">
        <thead>
          <tr>
            ${headers.map(h => `<th>${escapeXml(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${escapeXml(cell)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>3. SecOps Strategic Recommendations</h2>
      <div class="rec-box">
        ${defaultRecs.map((rec, i) => `<div class="rec-item"><strong>${i + 1}.</strong> ${escapeXml(rec)}</div>`).join('')}
      </div>

      <div class="signoff-section">
        <h2>4. Authorization & Sign-Off</h2>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div><strong>SecOps Lead / CISO Representative</strong></div>
          <div style="font-size: 9pt; color: #64748b;">${escapeXml(orgName)}</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div><strong>Vanguard Compliance Audit Officer</strong></div>
          <div style="font-size: 9pt; color: #64748b;">Autonomous Verification Engine</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.doc') ? filename : `${filename}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==========================================
// JSON EXPORT (SIEM / API Pipeline)
// ==========================================

export const exportToJSON = (
  filename: string,
  title: string,
  orgName: string,
  data: any
): void => {
  const payload = {
    platform: 'Vanguard Ops Autonomous SecOps & RMM',
    reportTitle: title,
    organization: orgName,
    exportedAt: new Date().toISOString(),
    recordCount: Array.isArray(data) ? data.length : 1,
    data
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


