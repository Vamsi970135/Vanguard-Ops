import { SystemPermission, CustomRole } from '../types';

export const SYSTEM_PERMISSIONS: SystemPermission[] = [
  // 1. Fleet & Endpoints
  {
    id: 'perm-01',
    key: 'endpoints.view',
    name: 'View Fleet & Endpoint Telemetry',
    description: 'Read-only access to host list, resource usage (CPU/RAM/Disk), agent health, and hardware inventory.',
    module: 'Fleet & Endpoints',
    riskLevel: 'Low'
  },
  {
    id: 'perm-02',
    key: 'endpoints.isolate',
    name: 'Emergency Host Network Isolation',
    description: 'Sever network interfaces on compromised endpoints while maintaining Vanguard C2 agent heartbeat.',
    module: 'Fleet & Endpoints',
    riskLevel: 'Critical',
    requiresMfa: true
  },
  {
    id: 'perm-03',
    key: 'endpoints.reboot',
    name: 'Reboot & Power State Management',
    description: 'Trigger graceful or forced host reboots and maintenance cycling across target endpoints.',
    module: 'Fleet & Endpoints',
    riskLevel: 'Medium'
  },
  {
    id: 'perm-04',
    key: 'endpoints.script_exec',
    name: 'Remote Script & Command Execution',
    description: 'Dispatch administrative PowerShell, Bash, and Python remediation scripts directly to endpoints.',
    module: 'Fleet & Endpoints',
    riskLevel: 'Critical',
    requiresMfa: true
  },
  {
    id: 'perm-05',
    key: 'endpoints.agent_deploy',
    name: 'Enroll New Hosts & Generate Agent Tokens',
    description: 'Generate tenant-scoped enrollment tokens and download MSI, PKG, and shell installer packages.',
    module: 'Fleet & Endpoints',
    riskLevel: 'Medium'
  },

  // 2. Vulnerabilities & CVEs
  {
    id: 'perm-06',
    key: 'vulns.view',
    name: 'Inspect CVE Vulnerability Posture',
    description: 'View detected CVEs, CVSS 3.1 exploit vectors, EPSS probability, and affected software packages.',
    module: 'Vulnerabilities & CVEs',
    riskLevel: 'Low'
  },
  {
    id: 'perm-07',
    key: 'vulns.scan_trigger',
    name: 'Trigger On-Demand Vulnerability Scans',
    description: 'Initiate fast credentialed or uncredentialed vulnerability sweeps across fleet clusters.',
    module: 'Vulnerabilities & CVEs',
    riskLevel: 'Medium'
  },
  {
    id: 'perm-08',
    key: 'vulns.sla_modify',
    name: 'Modify Remediation SLA Thresholds',
    description: 'Customize critical, high, and medium CVE remediation SLA deadlines and grace periods.',
    module: 'Vulnerabilities & CVEs',
    riskLevel: 'High'
  },
  {
    id: 'perm-09',
    key: 'vulns.risk_override',
    name: 'Mark False Positives & Risk Acceptance',
    description: 'Suppress vulnerability findings or accept organizational risk with documented justification.',
    module: 'Vulnerabilities & CVEs',
    riskLevel: 'High',
    requiresMfa: true
  },

  // 3. Patch Management
  {
    id: 'perm-10',
    key: 'patches.view',
    name: 'View Missing Patches & Staging Rings',
    description: 'Inspect OS and third-party software updates pending installation across host rings.',
    module: 'Patch Management',
    riskLevel: 'Low'
  },
  {
    id: 'perm-11',
    key: 'patches.approve',
    name: 'Approve Vendor Patches for Deployment',
    description: 'Validate and promote OS and third-party security updates into production deployment rings.',
    module: 'Patch Management',
    riskLevel: 'Medium'
  },
  {
    id: 'perm-12',
    key: 'patches.deploy',
    name: 'Execute Immediate Patch Deployment Jobs',
    description: 'Push silent updates immediately to targeted servers, workstations, and cluster groups.',
    module: 'Patch Management',
    riskLevel: 'High'
  },
  {
    id: 'perm-13',
    key: 'patches.policy_edit',
    name: 'Configure Automated Patch Policies & Rings',
    description: 'Define scheduled maintenance windows, auto-reboot policies, and staging ring delays.',
    module: 'Patch Management',
    riskLevel: 'High'
  },
  {
    id: 'perm-14',
    key: 'patches.rollback',
    name: 'Rollback & Uninstall Deployed Patches',
    description: 'Revert problematic updates and restore previous system restore checkpoints.',
    module: 'Patch Management',
    riskLevel: 'Critical',
    requiresMfa: true
  },

  // 4. SOC & Incident Response
  {
    id: 'perm-15',
    key: 'soc.alerts_view',
    name: 'View Real-Time SOC Alerts & Events',
    description: 'Monitor real-time SIEM alerts, MITRE technique tags, and endpoint behavioral anomalies.',
    module: 'SOC & Incident Response',
    riskLevel: 'Low'
  },
  {
    id: 'perm-16',
    key: 'soc.alerts_triage',
    name: 'Triage, Escalate & Dismiss Alerts',
    description: 'Acknowledge incoming alerts, assign analysts, tune alert status, and mark resolution.',
    module: 'SOC & Incident Response',
    riskLevel: 'Medium'
  },
  {
    id: 'perm-17',
    key: 'soc.incident_manage',
    name: 'Declare & Coordinate Incident War Rooms',
    description: 'Create P1/P2 critical incident tickets, assign incident commanders, and log timeline events.',
    module: 'SOC & Incident Response',
    riskLevel: 'High'
  },
  {
    id: 'perm-18',
    key: 'soc.playbook_exec',
    name: 'Trigger Autonomous Containment Playbooks',
    description: 'Execute automated SOAR workflows, user credential revocation, and firewall blocklists.',
    module: 'SOC & Incident Response',
    riskLevel: 'Critical',
    requiresMfa: true
  },
  {
    id: 'perm-19',
    key: 'soc.forensic_dump',
    name: 'Collect Volatile Memory & Forensic Artifacts',
    description: 'Capture RAM images, process dumps, prefetch files, and browser history for forensic investigation.',
    module: 'SOC & Incident Response',
    riskLevel: 'High'
  },

  // 5. Detection & Sigma Rules
  {
    id: 'perm-20',
    key: 'rules.view',
    name: 'View Detection Logic & Sigma Rules',
    description: 'Inspect active behavioral heuristics, correlation pipelines, and YARA signatures.',
    module: 'Detection & Sigma Rules',
    riskLevel: 'Low'
  },
  {
    id: 'perm-21',
    key: 'rules.create',
    name: 'Author & Publish Custom Detection Rules',
    description: 'Create new YAML/Sigma rules, behavioral thresholds, and sequence correlation logic.',
    module: 'Detection & Sigma Rules',
    riskLevel: 'High'
  },
  {
    id: 'perm-22',
    key: 'rules.enforce',
    name: 'Toggle Rule Enforcement & Automated Blocking',
    description: 'Switch rules between "Alert Only" mode and "Enforced Active Block" containment mode.',
    module: 'Detection & Sigma Rules',
    riskLevel: 'Critical',
    requiresMfa: true
  },
  {
    id: 'perm-23',
    key: 'rules.import_export',
    name: 'Import / Export Sigma & YARA Feeds',
    description: 'Synchronize external threat intelligence feeds and custom rule packages.',
    module: 'Detection & Sigma Rules',
    riskLevel: 'Medium'
  },

  // 6. Threat Hunting & Forensics
  {
    id: 'perm-24',
    key: 'hunting.query_exec',
    name: 'Execute Live Threat Hunting Queries',
    description: 'Run KQL-style queries across historical process executions, network connections, and registry mods.',
    module: 'Threat Hunting & Forensics',
    riskLevel: 'Medium'
  },
  {
    id: 'perm-25',
    key: 'hunting.save_queries',
    name: 'Save & Publish Hunting Playbooks',
    description: 'Publish verified threat hunting queries to the organization-wide intelligence library.',
    module: 'Threat Hunting & Forensics',
    riskLevel: 'Low'
  },
  {
    id: 'perm-26',
    key: 'mitre.matrix_view',
    name: 'Inspect MITRE ATT&CK Matrix Coverage',
    description: 'View defense coverage heatmaps and tactical gap analyses against enterprise adversary groups.',
    module: 'Threat Hunting & Forensics',
    riskLevel: 'Low'
  },

  // 7. Automated Reports & Compliance
  {
    id: 'perm-27',
    key: 'reports.view',
    name: 'View & Download Compliance Reports',
    description: 'Access past executive summaries, patch SLA reports, and NIST CSF 2.0 audit records.',
    module: 'Automated Reports',
    riskLevel: 'Low'
  },
  {
    id: 'perm-28',
    key: 'reports.generate',
    name: 'Generate Ad-Hoc Multi-Format Exports',
    description: 'Compile and export real-time PDF, Word, Excel, CSV, and JSON compliance packages.',
    module: 'Automated Reports',
    riskLevel: 'Low'
  },
  {
    id: 'perm-29',
    key: 'reports.schedule_edit',
    name: 'Configure Automated Report Schedules',
    description: 'Set up recurring report delivery schedules, email distributions, and webhook endpoints.',
    module: 'Automated Reports',
    riskLevel: 'Medium'
  },

  // 8. Tenant Management
  {
    id: 'perm-30',
    key: 'tenants.view',
    name: 'View Tenant Hierarchy & Site Topology',
    description: 'Access list of client organizations, geographic sites, and assigned network ranges.',
    module: 'Tenant Management',
    riskLevel: 'Low'
  },
  {
    id: 'perm-31',
    key: 'tenants.create',
    name: 'Provision New Tenant Organizations',
    description: 'Create new tenant organizations with isolated telemetry databases and custom SLA policies.',
    module: 'Tenant Management',
    riskLevel: 'High'
  },
  {
    id: 'perm-32',
    key: 'tenants.edit',
    name: 'Update Tenant Configurations & Perimeters',
    description: 'Modify tenant domain boundaries, risk thresholds, retention limits, and primary contacts.',
    module: 'Tenant Management',
    riskLevel: 'High'
  },
  {
    id: 'perm-33',
    key: 'tenants.delete',
    name: 'Purge & Deprovision Tenant Data',
    description: 'Permanently delete tenant organization data, endpoint telemetry, and configuration state.',
    module: 'Tenant Management',
    riskLevel: 'Critical',
    requiresMfa: true
  },

  // 9. System & RBAC Governance
  {
    id: 'perm-34',
    key: 'admin.users_manage',
    name: 'Manage System Users & Operator Accounts',
    description: 'Invite new operators, assign RBAC roles, reset MFA devices, and suspend access.',
    module: 'System & RBAC Governance',
    riskLevel: 'High'
  },
  {
    id: 'perm-35',
    key: 'admin.rbac_configure',
    name: 'Configure Custom RBAC Roles & Permissions',
    description: 'Define custom roles, assign granular permissions, and modify role capabilities.',
    module: 'System & RBAC Governance',
    riskLevel: 'Critical',
    requiresMfa: true
  },
  {
    id: 'perm-36',
    key: 'admin.brand_customize',
    name: 'Customize Brand Caption & Whitelabel',
    description: 'Update platform brand title, subtitle caption, support contacts, and whitelabel metadata.',
    module: 'System & RBAC Governance',
    riskLevel: 'Medium'
  },
  {
    id: 'perm-37',
    key: 'admin.audit_inspect',
    name: 'Inspect Immutable SOC Audit Trail',
    description: 'View cryptographically signed records of all configuration changes and administrative events.',
    module: 'System & RBAC Governance',
    riskLevel: 'Low'
  },
  {
    id: 'perm-38',
    key: 'admin.audit_rollback',
    name: 'Execute Configuration State Rollback',
    description: 'Revert modified security rules and system settings back to prior historical configurations.',
    module: 'System & RBAC Governance',
    riskLevel: 'Critical',
    requiresMfa: true
  }
];

export const INITIAL_CUSTOM_ROLES: CustomRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Unrestricted enterprise administrator with full platform visibility, tenant lifecycle management, system-wide configuration, and audit rollback authorization.',
    isSystem: true,
    color: 'purple',
    scope: 'Global MSP',
    permissions: SYSTEM_PERMISSIONS.map(p => p.key),
    assignedUsersCount: 2,
    createdAt: '2025-01-01',
    updatedAt: '2026-08-30',
    createdBy: 'System Bootstrap'
  },
  {
    id: 'role-soc-admin',
    name: 'SOC Admin',
    description: 'Lead security operations administrator authorized to create detection rules, execute automated containment, triage alerts, and coordinate incident war rooms.',
    isSystem: true,
    color: 'rose',
    scope: 'Global MSP',
    permissions: [
      'endpoints.view', 'endpoints.isolate', 'endpoints.reboot', 'endpoints.script_exec', 'endpoints.agent_deploy',
      'vulns.view', 'vulns.scan_trigger', 'vulns.sla_modify', 'vulns.risk_override',
      'patches.view', 'patches.approve', 'patches.deploy',
      'soc.alerts_view', 'soc.alerts_triage', 'soc.incident_manage', 'soc.playbook_exec', 'soc.forensic_dump',
      'rules.view', 'rules.create', 'rules.enforce', 'rules.import_export',
      'hunting.query_exec', 'hunting.save_queries', 'mitre.matrix_view',
      'reports.view', 'reports.generate', 'reports.schedule_edit',
      'tenants.view',
      'admin.audit_inspect'
    ],
    assignedUsersCount: 3,
    createdAt: '2025-01-01',
    updatedAt: '2026-08-25',
    createdBy: 'System Bootstrap'
  },
  {
    id: 'role-sec-analyst',
    name: 'Security Analyst',
    description: 'Frontline Tier-1 & Tier-2 security analyst investigating incoming detections, executing threat hunting sweeps, validating CVEs, and producing compliance reports.',
    isSystem: true,
    color: 'blue',
    scope: 'Tenant Scoped',
    permissions: [
      'endpoints.view',
      'vulns.view', 'vulns.scan_trigger',
      'patches.view',
      'soc.alerts_view', 'soc.alerts_triage', 'soc.incident_manage', 'soc.forensic_dump',
      'rules.view',
      'hunting.query_exec', 'hunting.save_queries', 'mitre.matrix_view',
      'reports.view', 'reports.generate',
      'tenants.view'
    ],
    assignedUsersCount: 5,
    createdAt: '2025-01-01',
    updatedAt: '2026-08-20',
    createdBy: 'System Bootstrap'
  },
  {
    id: 'role-it-admin',
    name: 'IT Admin',
    description: 'Infrastructure and endpoint management specialist responsible for patch ring orchestration, agent deployment, site maintenance, and routine fleet upkeep.',
    isSystem: true,
    color: 'amber',
    scope: 'Tenant Scoped',
    permissions: [
      'endpoints.view', 'endpoints.reboot', 'endpoints.agent_deploy', 'endpoints.script_exec',
      'vulns.view',
      'patches.view', 'patches.approve', 'patches.deploy', 'patches.policy_edit', 'patches.rollback',
      'reports.view', 'reports.generate', 'reports.schedule_edit',
      'tenants.view'
    ],
    assignedUsersCount: 4,
    createdAt: '2025-01-01',
    updatedAt: '2026-08-15',
    createdBy: 'System Bootstrap'
  },
  {
    id: 'role-compliance-auditor',
    name: 'Compliance Auditor',
    description: 'Independent oversight role with strictly read-only inspection access to security telemetry, cryptographic audit records, and automated compliance exports.',
    isSystem: true,
    color: 'emerald',
    scope: 'Global MSP',
    permissions: [
      'endpoints.view',
      'vulns.view',
      'patches.view',
      'soc.alerts_view',
      'rules.view',
      'mitre.matrix_view',
      'reports.view', 'reports.generate',
      'tenants.view',
      'admin.audit_inspect'
    ],
    assignedUsersCount: 2,
    createdAt: '2025-01-01',
    updatedAt: '2026-08-10',
    createdBy: 'System Bootstrap'
  },
  {
    id: 'role-incident-responder',
    name: 'Incident Responder (DFIR)',
    description: 'Specialized digital forensics and incident response operator with escalated host containment, volatile memory acquisition, and threat hunting authorizations.',
    isSystem: false,
    color: 'cyan',
    scope: 'Global MSP',
    permissions: [
      'endpoints.view', 'endpoints.isolate', 'endpoints.script_exec',
      'vulns.view',
      'soc.alerts_view', 'soc.alerts_triage', 'soc.incident_manage', 'soc.playbook_exec', 'soc.forensic_dump',
      'rules.view',
      'hunting.query_exec', 'hunting.save_queries', 'mitre.matrix_view',
      'reports.view', 'reports.generate',
      'tenants.view',
      'admin.audit_inspect'
    ],
    assignedUsersCount: 2,
    createdAt: '2025-05-12',
    updatedAt: '2026-08-18',
    createdBy: 'John Doe (Super Admin)'
  },
  {
    id: 'role-patch-deployment-lead',
    name: 'Patch Deployment Lead',
    description: 'DevOps / SysAdmin role focused exclusively on zero-day patch validation, staged ring deployments, and compliance SLA enforcement across server clusters.',
    isSystem: false,
    color: 'indigo',
    scope: 'Tenant Scoped',
    permissions: [
      'endpoints.view', 'endpoints.reboot',
      'vulns.view', 'vulns.scan_trigger', 'vulns.sla_modify',
      'patches.view', 'patches.approve', 'patches.deploy', 'patches.policy_edit', 'patches.rollback',
      'reports.view', 'reports.generate', 'reports.schedule_edit',
      'tenants.view'
    ],
    assignedUsersCount: 1,
    createdAt: '2025-06-04',
    updatedAt: '2026-08-22',
    createdBy: 'Sarah Lin (SOC Admin)'
  }
];

export const INITIAL_SYSTEM_USERS = [
  {
    id: 'u-001',
    name: 'John Doe',
    email: 'jdoe@vanguardops.io',
    role: 'Super Admin',
    avatar: 'JD',
    organizationId: 'all',
    organizationName: 'All Organizations (MSP)',
    mfaEnabled: true,
    lastLogin: '10 mins ago',
    status: 'Active' as const
  },
  {
    id: 'u-002',
    name: 'Sarah Lin',
    email: 'slin@globalenterprise.com',
    role: 'SOC Admin',
    avatar: 'SL',
    organizationId: 'org-1',
    organizationName: 'Global Enterprise Ltd',
    mfaEnabled: true,
    lastLogin: '1 hour ago',
    status: 'Active' as const
  },
  {
    id: 'u-003',
    name: 'Michael Chen',
    email: 'mchen@acmefinancial.com',
    role: 'Security Analyst',
    avatar: 'MC',
    organizationId: 'org-2',
    organizationName: 'Acme Financial Capital',
    mfaEnabled: true,
    lastLogin: '3 hours ago',
    status: 'Active' as const
  },
  {
    id: 'u-004',
    name: 'Elena Rostova',
    email: 'erostova@pacificbiohealth.org',
    role: 'IT Admin',
    avatar: 'ER',
    organizationId: 'org-3',
    organizationName: 'Pacific BioHealth Labs',
    mfaEnabled: true,
    lastLogin: 'Yesterday',
    status: 'Active' as const
  },
  {
    id: 'u-005',
    name: 'David Kim',
    email: 'dkim@vanguardops.io',
    role: 'Compliance Auditor',
    avatar: 'DK',
    organizationId: 'all',
    organizationName: 'All Organizations (MSP)',
    mfaEnabled: true,
    lastLogin: '3 days ago',
    status: 'Active' as const
  },
  {
    id: 'u-006',
    name: 'Marcus Vance',
    email: 'mvance@vanguardops.io',
    role: 'Incident Responder (DFIR)',
    avatar: 'MV',
    organizationId: 'all',
    organizationName: 'All Organizations (MSP)',
    mfaEnabled: true,
    lastLogin: '5 hours ago',
    status: 'Active' as const
  },
  {
    id: 'u-007',
    name: 'Aaliyah Patel',
    email: 'apatel@globalenterprise.com',
    role: 'Patch Deployment Lead',
    avatar: 'AP',
    organizationId: 'org-1',
    organizationName: 'Global Enterprise Ltd',
    mfaEnabled: true,
    lastLogin: '2 days ago',
    status: 'Active' as const
  }
];
