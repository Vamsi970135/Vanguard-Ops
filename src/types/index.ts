export type OrganizationRole = 
  | 'Super Admin' 
  | 'SOC Admin' 
  | 'Security Analyst' 
  | 'IT Admin' 
  | 'MSP Admin' 
  | 'Read-only'
  | 'Incident Responder'
  | 'Compliance Auditor'
  | 'Patch Deployment Lead'
  | string;

export type PermissionModule = 
  | 'Fleet & Endpoints'
  | 'Vulnerabilities & CVEs'
  | 'Patch Management'
  | 'SOC & Incident Response'
  | 'Detection & Sigma Rules'
  | 'Threat Hunting & Forensics'
  | 'Automated Reports'
  | 'Tenant Management'
  | 'System & RBAC Governance';

export type PermissionRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PermissionScope = 'Global MSP' | 'Tenant Scoped' | 'Site Specific';

export interface SystemPermission {
  id: string;
  key: string;
  name: string;
  description: string;
  module: PermissionModule;
  riskLevel: PermissionRiskLevel;
  requiresMfa?: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  color: string;
  scope: PermissionScope;
  permissions: string[];
  assignedUsersCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  avatar: string;
  organizationId: string;
  organizationName?: string;
  mfaEnabled: boolean;
  lastLogin: string;
  status?: 'Active' | 'Suspended' | 'Invited';
}

export interface Organization {
  id: string;
  name: string;
  plan: 'Enterprise' | 'MSP Standard' | 'Healthcare Pro' | 'Financial Gov' | 'Enterprise Elite' | 'MSSP Partner Multi-Tenant' | 'Professional Growth' | 'Standard';
  siteCount: number;
  endpointCount: number;
  riskScore: number;
  logo: string;
  domain?: string;
  region?: string;
  primaryContact?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  sites?: string[];
  enrollmentToken?: string;
  customRiskThreshold?: number;
  slaDaysCritical?: number;
  dataRetentionDays?: number;
  createdAt?: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  organizationId: string; // 'all' or specific tenant ID
  organizationName?: string;
  reportType: 'executive' | 'patch_sla' | 'nist' | 'cisa' | 'soc_incident' | 'endpoint_inventory' | 'Executive Summary' | 'Patch Management SLA' | 'NIST CSF 2.0 Assessment' | 'CISA KEV Zero-Day' | 'Fleet Inventory' | 'SOC Alerts & Incident Triage';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On Critical Alert' | 'On SLA Breach';
  timeUtc: string;
  timeOfDay?: string;
  format?: 'PDF' | 'DOC' | 'EXCEL' | 'CSV' | 'JSON';
  formats: ('PDF' | 'DOC' | 'EXCEL' | 'CSV' | 'JSON')[];
  recipients: string[];
  destinations: ('email' | 'slack_webhook' | 'teams_webhook' | 's3_bucket')[];
  status: 'Active' | 'Paused';
  lastRun?: string;
  nextRun: string;
  executionCount: number;
}

export interface ReportExecutionLog {
  id: string;
  scheduleId?: string;
  scheduleName: string;
  organizationName: string;
  reportType: string;
  format: 'PDF' | 'DOC' | 'EXCEL' | 'CSV' | 'JSON';
  generatedAt: string;
  fileSizeBytes: number;
  status: 'Delivered' | 'Pending' | 'Failed';
  recipientCount: number;
  downloadUrl?: string;
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  endpointCount: number;
  status: 'Healthy' | 'Warning' | 'Critical';
}

export type OSPlatform = 'windows' | 'linux' | 'macos';

export interface Endpoint {
  id: string;
  organizationId: string;
  siteId: string;
  hostname: string;
  ipAddress: string;
  publicIp?: string;
  macAddress: string;
  osPlatform: OSPlatform;
  osName: string;
  osVersion: string;
  deviceType: 'Server' | 'Workstation' | 'Laptop' | 'Unmanaged';
  agentVersion: string;
  status: 'Online' | 'Offline' | 'At-Risk' | 'Unhealthy' | 'Unmanaged';
  lastSeen: string;
  cpuModel: string;
  cpuUsage: number; // percentage 0-100
  ramUsage: number; // percentage 0-100
  ramTotalGb: number;
  diskUsage: number; // percentage 0-100
  diskTotalGb: number;
  riskScore: number; // 0-100
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  isInternetFacing: boolean;
  isIsolated: boolean;
  rebootPending: boolean;
  missingPatchesCount: number;
  criticalPatchesCount: number;
  vulnerabilitiesCount: number;
  criticalVulnsCount: number;
  firewallEnabled: boolean;
  antivirusStatus: 'Active' | 'Outdated' | 'Disabled';
  edrStatus: 'Active' | 'Degraded' | 'Offline';
  diskEncryption: boolean;
  secureBoot: boolean;
  tags: string[];
  assignedUser?: string;
}

export interface SoftwarePackage {
  id: string;
  name: string;
  vendor: string;
  version: string;
  installDate: string;
  sizeMb: number;
  hasVulnerability: boolean;
  vulnerabilityCve?: string;
}

export interface SystemProcess {
  pid: number;
  name: string;
  user: string;
  cpuPercent: number;
  memPercent: number;
  commandLine: string;
  isSuspicious?: boolean;
}

export interface SystemService {
  name: string;
  displayName: string;
  status: 'Running' | 'Stopped' | 'Paused';
  startupType: 'Automatic' | 'Manual' | 'Disabled';
}

export interface NetworkPort {
  port: number;
  protocol: 'TCP' | 'UDP';
  state: 'Listening' | 'Established' | 'TimeWait';
  service: string;
  process: string;
  isExposed: boolean;
}

export type PatchSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type PatchType = 'Security' | 'Bug Fix' | 'Feature Update' | 'Third-Party';

export interface Patch {
  id: string;
  kbOrId: string;
  title: string;
  vendor: string;
  product: string;
  osPlatform: OSPlatform;
  severity: PatchSeverity;
  patchType: PatchType;
  category?: string;
  compliancePercentage?: number;
  cves: string[];
  releaseDate: string;
  rebootRequired: boolean;
  applicableEndpointsCount: number;
  installedEndpointsCount: number;
  failedEndpointsCount: number;
  status: 'Approved' | 'Pending Approval' | 'Declined' | 'Deployed';
  downloadSizeMb: number;
  organizationId?: string;
}

export interface PatchPolicy {
  id: string;
  name: string;
  organizationId: string;
  targetGroup: string;
  osPlatform: OSPlatform | 'all';
  severities: PatchSeverity[];
  approvalMode: 'Automatic' | 'Manual Approval';
  scheduleCron: string; // e.g. "Sunday at 02:00"
  maintenanceWindowHours: number;
  rebootBehavior: 'Always' | 'If Required' | 'Prompt User' | 'Suppress';
  autoRollback: boolean;
  enabled: boolean;
}

export interface PatchDeploymentJob {
  id: string;
  patchId: string;
  patchTitle: string;
  organizationId?: string;
  targetCount: number;
  progressPercent: number;
  stage: 'Queued' | 'Downloading' | 'Verifying' | 'Installing' | 'Rebooting' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
  successfulCount: number;
  failedCount: number;
}

export interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  description: string;
  cvssScore: number;
  epssScore: number; // 0.00 to 1.00
  isCisaKev: boolean; // Known Exploited Vulnerability
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  calculatedRiskScore: number; // dynamically computed
  affectedSoftware: string;
  affectedVersion: string;
  fixedVersion: string;
  firstDetected: string;
  lastDetected: string;
  affectedEndpointsCount: number;
  remediationStatus: 'Open' | 'In Progress' | 'Patch Available' | 'Remediated' | 'Accepted Risk';
  patchId?: string;
  hasExploitAvailable: boolean;
  category: 'RCE' | 'Privilege Escalation' | 'Denial of Service' | 'Info Disclosure' | 'Authentication Bypass';
  organizationId?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  organizationId: string;
  endpointId: string;
  hostname: string;
  userId?: string;
  source: 'Endpoint Agent' | 'Windows Event' | 'Syslog' | 'CloudTrail' | 'Firewall' | 'EDR' | 'M365';
  eventType: 'process_creation' | 'failed_logon' | 'successful_logon' | 'network_connection' | 'privilege_escalation' | 'file_modification' | 'registry_change';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  sourceIp: string;
  destinationIp?: string;
  destinationPort?: number;
  process?: string;
  commandLine?: string;
  message: string;
  rawJson?: string;
}

export interface SOCAlert {
  id: string;
  organizationId?: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  detectionRule: string;
  timestamp: string;
  endpointId: string;
  hostname: string;
  ipAddress: string;
  user: string;
  status: 'New' | 'Triaged' | 'Investigating' | 'Contained' | 'Closed' | 'False Positive';
  assignedAnalyst?: string;
  mitreTactic: string;
  mitreTechnique: string;
  mitreId: string;
  relatedEventsCount: number;
  description: string;
  evidence: string[];
  recommendedActions: string[];
}

export interface SOCIncident {
  id: string;
  organizationId?: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Triage' | 'Investigating' | 'Containment' | 'Eradication' | 'Recovery' | 'Closed' | 'Resolved';
  assignedAnalyst: string;
  leadInvestigator: string;
  createdAt: string;
  updatedAt: string;
  affectedAssets: string[];
  affectedUsers: string[];
  alertIds: string[];
  summary: string;
  mitreTechniques: string[];
  timeline: { time: string; action: string; author: string }[];
  notes: { id: string; time: string; author: string; text: string }[];
  remediationTasks: { id: string; task: string; done: boolean; requiredRole: string }[];
}

export type RuleConditionCategory = 'endpoint' | 'hardware' | 'software' | 'patch' | 'security' | 'vulnerability';

export interface RuleCondition {
  id: string;
  category: RuleConditionCategory;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_true' | 'is_false' | 'in_list';
  value: string;
}

export interface RuleAction {
  id: string;
  actionType: 
    | 'create_alert' 
    | 'create_incident' 
    | 'set_risk_score' 
    | 'isolate_endpoint' 
    | 'deploy_patch' 
    | 'start_vuln_scan' 
    | 'send_slack' 
    | 'send_email' 
    | 'kill_process' 
    | 'restart_service';
  params: Record<string, any>;
  isDangerous?: boolean;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Endpoint Security' | 'Patch' | 'Vulnerability' | 'Identity' | 'Network' | 'Compliance';
  triggerType: 'On Event' | 'Scheduled (Hourly)' | 'Scheduled (Daily)' | 'Continuous';
  matchLogic: 'ALL' | 'ANY';
  conditions: RuleCondition[];
  actions: RuleAction[];
  mode: 'Dry Run' | 'Alert Only' | 'Enforced';
  enabled: boolean;
  lastRun?: string;
  matchCount: number;
  createdBy: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  status: 'Active' | 'Paused' | 'Draft';
  steps: { id: string; name: string; type: 'trigger' | 'condition' | 'action' | 'approval'; detail: string }[];
  lastExecuted: string;
  executionCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail?: string;
  organization: string;
  organizationId?: string;
  ip: string;
  category?: 'Security Rule' | 'System Setting' | 'Tenant Perimeter' | 'Access & RBAC' | 'Vulnerability Policy' | 'Patch Policy' | 'Compliance';
  action: string;
  object: string;
  targetId?: string;
  previousValue?: string;
  newValue?: string;
  diffSummary?: string;
  signatureHash?: string;
  result: 'Success' | 'Denied' | 'Failed';
  severity?: 'Info' | 'Warning' | 'High' | 'Critical';
}

export interface ThreatHuntQuery {
  id: string;
  name: string;
  category: string;
  query: string;
  description: string;
  mitreMapping: string;
  targetCount: number;
  lastRun: string;
}
