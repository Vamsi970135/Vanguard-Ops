import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  Organization,
  Site,
  User,
  Endpoint,
  Patch,
  PatchPolicy,
  PatchDeploymentJob,
  Vulnerability,
  SecurityEvent,
  SOCAlert,
  SOCIncident,
  CustomRule,
  AutomationWorkflow,
  AuditLog,
  OrganizationRole,
  ReportSchedule,
  ReportExecutionLog,
  CustomRole,
  SystemPermission
} from '../types';
import {
  mockOrganizations,
  mockSites,
  mockCurrentUser,
  mockEndpoints,
  mockPatches,
  mockPatchPolicies,
  mockDeploymentJobs,
  mockVulnerabilities,
  mockSecurityEvents,
  mockSOCAlerts,
  mockSOCIncidents,
  mockCustomRules,
  mockWorkflows,
  mockAuditLogs,
  mockReportSchedules,
  mockReportExecutionLogs
} from '../data/mockData';
import {
  SYSTEM_PERMISSIONS,
  INITIAL_CUSTOM_ROLES,
  INITIAL_SYSTEM_USERS
} from '../data/rbacData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export type MainNavTab = 
  | 'dashboard' 
  | 'endpoints' 
  | 'patches' 
  | 'vulnerabilities' 
  | 'soc' 
  | 'alerts' 
  | 'incidents' 
  | 'hunting' 
  | 'mitre'
  | 'rules' 
  | 'workflows' 
  | 'reports' 
  | 'admin';

interface AppContextType {
  currentOrg: Organization;
  selectedOrgId: string;
  organizations: Organization[];
  switchOrg: (orgId: string) => void;
  addOrganization: (newOrg: Partial<Organization>) => Organization;
  deleteOrganization: (orgId: string) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
  recordAuditLog: (entry: Partial<AuditLog> & { action: string; object: string }) => void;
  
  currentUser: User;
  setUserRole: (role: OrganizationRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeNav: MainNavTab;
  setActiveNav: (tab: MainNavTab) => void;
  activeSubTab: string;
  setActiveSubTab: (sub: string) => void;
  
  // Data entities (Tenant-isolated when specific tenant is active)
  endpoints: Endpoint[];
  sites: Site[];
  patches: Patch[];
  patchPolicies: PatchPolicy[];
  deploymentJobs: PatchDeploymentJob[];
  vulnerabilities: Vulnerability[];
  securityEvents: SecurityEvent[];
  alerts: SOCAlert[];
  incidents: SOCIncident[];
  customRules: CustomRule[];
  workflows: AutomationWorkflow[];
  auditLogs: AuditLog[];
  reportSchedules: ReportSchedule[];
  reportLogs: ReportExecutionLog[];
  
  // Modals and drawers
  selectedEndpoint: Endpoint | null;
  setSelectedEndpoint: (ep: Endpoint | null) => void;
  selectedAlert: SOCAlert | null;
  setSelectedAlert: (al: SOCAlert | null) => void;
  selectedIncident: SOCIncident | null;
  setSelectedIncident: (inc: SOCIncident | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isAgentInstallModalOpen: boolean;
  setIsAgentInstallModalOpen: (open: boolean) => void;
  
  // Actions
  registerEndpoint: (endpointData: Partial<Endpoint>) => Endpoint;
  isolateEndpoint: (endpointId: string) => void;
  unisolateEndpoint: (endpointId: string) => void;
  triggerScan: (endpointId: string, type: 'vulnerability' | 'patch' | 'full') => void;
  rebootEndpoint: (endpointId: string) => void;
  deployPatch: (patchId: string, endpointId?: string) => void;
  remediateVulnerability: (vulnId: string) => void;
  updateAlertStatus: (alertId: string, status: SOCAlert['status']) => void;
  escalateAlertToIncident: (alertId: string) => void;
  updateIncidentStatus: (incidentId: string, status: SOCIncident['status']) => void;
  addIncidentNote: (incidentId: string, text: string) => void;
  toggleIncidentTask: (incidentId: string, taskId: string) => void;
  saveCustomRule: (rule: CustomRule) => void;
  toggleCustomRule: (ruleId: string) => void;
  testCustomRule: (rule: CustomRule) => { matchCount: number; matchedEndpoints: Endpoint[] };
  executeRemoteCommand: (endpointId: string, command: string) => Promise<string>;
  
  // Scheduled Report Actions
  addReportSchedule: (schedule: Partial<ReportSchedule>) => void;
  deleteReportSchedule: (id: string) => void;
  toggleReportSchedule: (id: string) => void;
  triggerReportNow: (scheduleId?: string, reportType?: string, format?: 'PDF' | 'DOC' | 'EXCEL' | 'CSV' | 'JSON') => void;

  // RBAC & Custom Roles
  roles: CustomRole[];
  systemUsers: User[];
  systemPermissions: SystemPermission[];
  addCustomRole: (roleData: Partial<CustomRole>) => CustomRole;
  updateCustomRole: (roleId: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (roleId: string) => boolean;
  cloneCustomRole: (roleId: string, newName?: string) => CustomRole;
  addSystemUser: (userData: Partial<User>) => User;
  updateSystemUser: (userId: string, updates: Partial<User>) => void;
  deleteSystemUser: (userId: string) => void;

  // Live Simulation state
  isLiveSimulationActive: boolean;
  toggleLiveSimulation: () => void;
  eventsCountToday: number;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-1');
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeNav, setActiveNav] = useState<MainNavTab>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  
  // Master raw stores
  const [rawEndpoints, setRawEndpoints] = useState<Endpoint[]>(mockEndpoints);
  const [rawSites, setRawSites] = useState<Site[]>(mockSites);
  const [rawPatches, setRawPatches] = useState<Patch[]>(mockPatches);
  const [rawPatchPolicies, setRawPatchPolicies] = useState<PatchPolicy[]>(mockPatchPolicies);
  const [rawDeploymentJobs, setDeploymentJobs] = useState<PatchDeploymentJob[]>(mockDeploymentJobs);
  const [rawVulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(mockVulnerabilities);
  const [rawSecurityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [rawAlerts, setAlerts] = useState<SOCAlert[]>(mockSOCAlerts);
  const [rawIncidents, setIncidents] = useState<SOCIncident[]>(mockSOCIncidents);
  const [rawCustomRules, setCustomRules] = useState<CustomRule[]>(mockCustomRules);
  const [rawWorkflows, setWorkflows] = useState<AutomationWorkflow[]>(mockWorkflows);
  const [rawAuditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [rawReportSchedules, setReportSchedules] = useState<ReportSchedule[]>(mockReportSchedules);
  const [rawReportLogs, setReportLogs] = useState<ReportExecutionLog[]>(mockReportExecutionLogs);
  const [roles, setRoles] = useState<CustomRole[]>(INITIAL_CUSTOM_ROLES);
  const [systemUsers, setSystemUsers] = useState<User[]>(INITIAL_SYSTEM_USERS);

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<SOCAlert | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SOCIncident | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAgentInstallModalOpen, setIsAgentInstallModalOpen] = useState(false);
  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState(true);
  const [eventsCountToday, setEventsCountToday] = useState(142391);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Calculate current active organization object
  const currentOrg: Organization = useMemo(() => {
    if (selectedOrgId === 'all') {
      const totalEndpoints = rawEndpoints.length;
      const totalSites = rawSites.length;
      const avgRisk = organizations.length
        ? Math.round(organizations.reduce((acc, o) => acc + o.riskScore, 0) / organizations.length)
        : 50;
      return {
        id: 'all',
        name: 'All Tenant Organizations (MSP Global View)',
        plan: 'Enterprise',
        siteCount: totalSites,
        endpointCount: totalEndpoints,
        riskScore: avgRisk,
        logo: 'MSP',
        region: 'Global Multi-Region',
        primaryContact: 'msp-lead@vanguardops.io',
        enrollmentToken: 'VO-MSP-MULTI-TENANT-KEY'
      };
    }
    const found = organizations.find(o => o.id === selectedOrgId);
    if (found) {
      // Dynamic count of real active endpoints for this tenant
      const activeCount = rawEndpoints.filter(e => e.organizationId === selectedOrgId).length;
      return { ...found, endpointCount: activeCount };
    }
    return organizations[0] || {
      id: 'org-1',
      name: 'Default Tenant',
      plan: 'Enterprise',
      siteCount: 1,
      endpointCount: 0,
      riskScore: 30,
      logo: 'DT'
    };
  }, [selectedOrgId, organizations, rawEndpoints, rawSites]);

  // Apply dark mode class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global keydown for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const switchOrg = useCallback((orgId: string) => {
    setSelectedOrgId(orgId);
    if (orgId === 'all') {
      addToast('Tenant Filter: Global View', 'Displaying unified telemetry across all managed tenant organizations.', 'info');
    } else {
      const found = organizations.find(o => o.id === orgId);
      if (found) {
        addToast('Tenant Switched', `Filtered view strictly to ${found.name} (${found.id}). All data isolated.`, 'info');
      }
    }
  }, [organizations, addToast]);

  const addOrganization = useCallback((newOrgData: Partial<Organization>) => {
    const newId = newOrgData.id || `org-${Date.now().toString(36)}`;
    const initials = (newOrgData.name || 'NT')
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const createdOrg: Organization = {
      id: newId,
      name: newOrgData.name || 'New Enterprise Tenant',
      plan: newOrgData.plan || 'Enterprise',
      siteCount: newOrgData.siteCount || 1,
      endpointCount: 0,
      riskScore: newOrgData.riskScore || 32,
      logo: newOrgData.logo || initials,
      region: newOrgData.region || 'US-East (N. Virginia)',
      primaryContact: newOrgData.primaryContact || 'admin@tenant.org',
      enrollmentToken: `VO-TOKEN-${initials}-${Math.floor(10000 + Math.random() * 90000)}`,
      customRiskThreshold: newOrgData.customRiskThreshold || 65,
      slaDaysCritical: newOrgData.slaDaysCritical || 14,
      dataRetentionDays: newOrgData.dataRetentionDays || 365,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOrganizations(prev => [...prev, createdOrg]);

    // Create default site for new tenant
    const defaultSite: Site = {
      id: `site-${newId}-1`,
      organizationId: newId,
      name: `${createdOrg.name} Primary DC`,
      location: createdOrg.region || 'Primary Cloud Location',
      endpointCount: 0,
      status: 'Healthy'
    };
    setRawSites(prev => [...prev, defaultSite]);

    // Log in audit log
    const auditEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: `${currentUser.name} (${currentUser.role})`,
      organization: createdOrg.name,
      ip: '10.240.5.12',
      action: 'Tenant Organization Created',
      object: `Tenant: ${createdOrg.name} (${createdOrg.id})`,
      previousValue: 'None',
      newValue: `Plan: ${createdOrg.plan}, Region: ${createdOrg.region}`,
      result: 'Success'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    // Switch to newly created tenant
    setSelectedOrgId(newId);
    addToast('Tenant Created Successfully', `Provisioned tenant ${createdOrg.name}. Active view automatically switched.`, 'success');
    return createdOrg;
  }, [currentUser, addToast]);

  const deleteOrganization = useCallback((orgId: string) => {
    if (organizations.length <= 1) {
      addToast('Cannot Delete Tenant', 'At least one tenant organization must remain active.', 'error');
      return;
    }

    const orgToDelete = organizations.find(o => o.id === orgId);
    if (!orgToDelete) return;

    setOrganizations(prev => prev.filter(o => o.id !== orgId));
    setRawEndpoints(prev => prev.filter(e => e.organizationId !== orgId));
    setRawSites(prev => prev.filter(s => s.organizationId !== orgId));
    setAlerts(prev => prev.filter(a => a.organizationId !== orgId));
    setIncidents(prev => prev.filter(i => i.organizationId !== orgId));
    setRawPatchPolicies(prev => prev.filter(p => p.organizationId !== orgId));

    // If deleting currently active tenant, switch to another
    if (selectedOrgId === orgId) {
      const nextOrg = organizations.find(o => o.id !== orgId);
      if (nextOrg) {
        setSelectedOrgId(nextOrg.id);
      }
    }

    const auditEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: `${currentUser.name} (${currentUser.role})`,
      organization: 'Vanguard Admin Engine',
      ip: '10.240.5.12',
      action: 'Tenant Organization Deleted',
      object: `Tenant: ${orgToDelete.name} (${orgToDelete.id})`,
      previousValue: `Plan: ${orgToDelete.plan}, Assets: ${orgToDelete.endpointCount}`,
      newValue: 'DELETED',
      result: 'Success'
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    addToast('Tenant Deleted', `Organization ${orgToDelete.name} and all associated telemetry have been purged.`, 'warning');
  }, [organizations, selectedOrgId, currentUser, addToast]);

  const updateOrganization = useCallback((orgId: string, updates: Partial<Organization>) => {
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, ...updates } : o));
    addToast('Tenant Updated', `Settings for ${updates.name || orgId} updated.`, 'success');
  }, [addToast]);

  const setUserRole = useCallback((role: OrganizationRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
    addToast('RBAC Role Updated', `Current user session active as ${role}`, 'info');
  }, [addToast]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleLiveSimulation = useCallback(() => {
    setIsLiveSimulationActive(prev => {
      const next = !prev;
      addToast(
        next ? 'Real-Time Stream Active' : 'Real-Time Stream Paused',
        next ? 'Receiving simulated agent telemetry & SOC events' : 'Event processing stream paused by operator',
        'info'
      );
      return next;
    });
  }, [addToast]);

  // Periodic simulated live event ticker
  useEffect(() => {
    if (!isLiveSimulationActive) return;
    const interval = setInterval(() => {
      setEventsCountToday(prev => prev + Math.floor(Math.random() * 8) + 2);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveSimulationActive]);

  const recordAuditLog = useCallback((entry: Partial<AuditLog> & { action: string; object: string }) => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newLog: AuditLog = {
      id: entry.id || `aud-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: entry.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: entry.user || `${currentUser.name} (${currentUser.role})`,
      userEmail: entry.userEmail || currentUser.email,
      organization: entry.organization || currentOrg.name,
      organizationId: entry.organizationId || currentOrg.id,
      ip: entry.ip || '10.240.5.12',
      category: entry.category || 'System Setting',
      action: entry.action,
      object: entry.object,
      targetId: entry.targetId,
      previousValue: entry.previousValue || 'N/A',
      newValue: entry.newValue || 'Updated',
      diffSummary: entry.diffSummary,
      signatureHash: entry.signatureHash || `sha256:${randomHex}${Date.now().toString(16)}`,
      result: entry.result || 'Success',
      severity: entry.severity || 'Info'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser, currentOrg]);

  const recordAudit = useCallback((action: string, object: string, prevVal: string, newVal: string) => {
    recordAuditLog({
      action,
      object,
      previousValue: prevVal,
      newValue: newVal,
      category: action.toLowerCase().includes('rule') ? 'Security Rule' : 'System Setting'
    });
  }, [recordAuditLog]);

  // -------------------------------------------------------------
  // DYNAMIC TENANT DATA ISOLATION (Strict filtering when org selected)
  // -------------------------------------------------------------
  const endpoints = useMemo(() => {
    if (selectedOrgId === 'all') return rawEndpoints;
    return rawEndpoints.filter(e => e.organizationId === selectedOrgId);
  }, [rawEndpoints, selectedOrgId]);

  const sites = useMemo(() => {
    if (selectedOrgId === 'all') return rawSites;
    return rawSites.filter(s => s.organizationId === selectedOrgId);
  }, [rawSites, selectedOrgId]);

  const alerts = useMemo(() => {
    if (selectedOrgId === 'all') return rawAlerts;
    const tenantEndpointIds = new Set(rawEndpoints.filter(e => e.organizationId === selectedOrgId).map(e => e.id));
    return rawAlerts.filter(a => (a.organizationId && a.organizationId === selectedOrgId) || tenantEndpointIds.has(a.endpointId));
  }, [rawAlerts, rawEndpoints, selectedOrgId]);

  const incidents = useMemo(() => {
    if (selectedOrgId === 'all') return rawIncidents;
    const tenantEndpointIds = new Set(rawEndpoints.filter(e => e.organizationId === selectedOrgId).map(e => e.hostname));
    return rawIncidents.filter(i => {
      if (i.organizationId && i.organizationId === selectedOrgId) return true;
      return i.affectedAssets.some(asset => Array.from(tenantEndpointIds).some(h => asset.includes(h)));
    });
  }, [rawIncidents, rawEndpoints, selectedOrgId]);

  const patches = useMemo(() => {
    if (selectedOrgId === 'all') return rawPatches;
    return rawPatches.filter(p => !p.organizationId || p.organizationId === selectedOrgId || p.organizationId === 'all');
  }, [rawPatches, selectedOrgId]);

  const patchPolicies = useMemo(() => {
    if (selectedOrgId === 'all') return rawPatchPolicies;
    return rawPatchPolicies.filter(p => p.organizationId === selectedOrgId || p.organizationId === 'all');
  }, [rawPatchPolicies, selectedOrgId]);

  const deploymentJobs = useMemo(() => {
    if (selectedOrgId === 'all') return rawDeploymentJobs;
    return rawDeploymentJobs.filter(j => !j.organizationId || j.organizationId === selectedOrgId);
  }, [rawDeploymentJobs, selectedOrgId]);

  const vulnerabilities = useMemo(() => {
    if (selectedOrgId === 'all') return rawVulnerabilities;
    return rawVulnerabilities.filter(v => !v.organizationId || v.organizationId === selectedOrgId);
  }, [rawVulnerabilities, selectedOrgId]);

  const securityEvents = useMemo(() => {
    if (selectedOrgId === 'all') return rawSecurityEvents;
    return rawSecurityEvents.filter(e => e.organizationId === selectedOrgId);
  }, [rawSecurityEvents, selectedOrgId]);

  const customRules = useMemo(() => {
    if (selectedOrgId === 'all') return rawCustomRules;
    return rawCustomRules.filter(r => !r.organizationId || r.organizationId === selectedOrgId || r.organizationId === 'all');
  }, [rawCustomRules, selectedOrgId]);

  const workflows = useMemo(() => {
    if (selectedOrgId === 'all') return rawWorkflows;
    return rawWorkflows.filter(w => !w.organizationId || w.organizationId === selectedOrgId || w.organizationId === 'all');
  }, [rawWorkflows, selectedOrgId]);

  const auditLogs = useMemo(() => {
    if (selectedOrgId === 'all') return rawAuditLogs;
    return rawAuditLogs.filter(a => a.organization.toLowerCase().includes(currentOrg.name.toLowerCase()) || a.organization === currentOrg.name);
  }, [rawAuditLogs, selectedOrgId, currentOrg]);

  const reportSchedules = useMemo(() => {
    if (selectedOrgId === 'all') return rawReportSchedules;
    return rawReportSchedules.filter(s => s.organizationId === 'all' || s.organizationId === selectedOrgId);
  }, [rawReportSchedules, selectedOrgId]);

  const reportLogs = useMemo(() => {
    if (selectedOrgId === 'all') return rawReportLogs;
    return rawReportLogs.filter(l => l.organizationName.toLowerCase().includes(currentOrg.name.toLowerCase()) || l.organizationName === 'All Organizations (MSP)');
  }, [rawReportLogs, selectedOrgId, currentOrg]);

  // -------------------------------------------------------------
  // AGENT REGISTRATION & ENDPOINT ADDITION
  // -------------------------------------------------------------
  const registerEndpoint = useCallback((data: Partial<Endpoint>): Endpoint => {
    const targetOrgId = selectedOrgId === 'all' ? 'org-1' : selectedOrgId;
    const targetOrg = organizations.find(o => o.id === targetOrgId) || organizations[0];
    const targetSite = rawSites.find(s => s.organizationId === targetOrgId) || rawSites[0];

    const newEndpoint: Endpoint = {
      id: `ep-${Date.now().toString(36)}`,
      organizationId: targetOrgId,
      siteId: targetSite ? targetSite.id : 'site-1',
      hostname: data.hostname || `NODE-${Math.floor(1000 + Math.random() * 9000)}`,
      ipAddress: data.ipAddress || `10.240.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}`,
      publicIp: data.publicIp || `198.51.${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 250)}`,
      macAddress: data.macAddress || `00:${Array.from({ length: 5 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':')}`,
      osPlatform: data.osPlatform || 'windows',
      osName: data.osName || (data.osPlatform === 'linux' ? 'Ubuntu 24.04 LTS' : data.osPlatform === 'macos' ? 'macOS Sonoma 14.6' : 'Windows 11 Pro 23H2'),
      osVersion: data.osVersion || 'Kernel v6.8.0-35-generic',
      deviceType: data.deviceType || 'Workstation',
      agentVersion: 'v4.9.0-prod (Live Agent)',
      status: 'Online',
      lastSeen: 'Just now',
      cpuModel: data.cpuModel || 'AMD Ryzen 9 / Intel Core i7 16-Core',
      cpuUsage: Math.floor(Math.random() * 30) + 10,
      ramUsage: Math.floor(Math.random() * 40) + 30,
      ramTotalGb: data.ramTotalGb || 32,
      diskUsage: Math.floor(Math.random() * 40) + 20,
      diskTotalGb: data.diskTotalGb || 1000,
      riskScore: 18,
      criticality: data.criticality || 'Medium',
      isInternetFacing: data.isInternetFacing || false,
      isIsolated: false,
      rebootPending: false,
      missingPatchesCount: 0,
      criticalPatchesCount: 0,
      vulnerabilitiesCount: 0,
      criticalVulnsCount: 0,
      firewallEnabled: true,
      antivirusStatus: 'Active',
      edrStatus: 'Active',
      diskEncryption: true,
      secureBoot: true,
      tags: data.tags || ['Live Registered', targetOrg.name, 'Vanguard-Agent'],
      assignedUser: data.assignedUser || currentUser.email
    };

    setRawEndpoints(prev => [newEndpoint, ...prev]);

    // Update site and org endpoint counts
    setRawSites(prev => prev.map(s => s.id === newEndpoint.siteId ? { ...s, endpointCount: s.endpointCount + 1 } : s));
    setOrganizations(prev => prev.map(o => o.id === targetOrgId ? { ...o, endpointCount: o.endpointCount + 1 } : o));

    recordAudit('Agent Enrolled Endpoint', `Host: ${newEndpoint.hostname} (${newEndpoint.ipAddress})`, 'Status: Unmanaged', `Status: Online (Agent ${newEndpoint.agentVersion})`);
    addToast('Live Agent Enrolled & Connected', `${newEndpoint.hostname} (${newEndpoint.osName}) added to ${targetOrg.name}. Telemetry streaming active.`, 'success');

    return newEndpoint;
  }, [selectedOrgId, organizations, rawSites, currentUser, recordAudit, addToast]);

  // Endpoint Actions
  const isolateEndpoint = useCallback((endpointId: string) => {
    setRawEndpoints(prev => prev.map(ep => {
      if (ep.id === endpointId) {
        return { ...ep, isIsolated: true, status: 'At-Risk' };
      }
      return ep;
    }));
    const target = rawEndpoints.find(e => e.id === endpointId);
    if (target) {
      recordAudit('Endpoint Isolation Enforced', `Endpoint ${target.hostname} (${target.ipAddress})`, 'isIsolated: false', 'isIsolated: true');
      addToast('Host Quarantined', `${target.hostname} has been isolated from all non-agent network traffic.`, 'warning');
    }
  }, [rawEndpoints, recordAudit, addToast]);

  const unisolateEndpoint = useCallback((endpointId: string) => {
    setRawEndpoints(prev => prev.map(ep => {
      if (ep.id === endpointId) {
        return { ...ep, isIsolated: false };
      }
      return ep;
    }));
    const target = rawEndpoints.find(e => e.id === endpointId);
    if (target) {
      recordAudit('Endpoint Isolation Removed', `Endpoint ${target.hostname} (${target.ipAddress})`, 'isIsolated: true', 'isIsolated: false');
      addToast('Host Restored', `${target.hostname} network connectivity restored.`, 'success');
    }
  }, [rawEndpoints, recordAudit, addToast]);

  const triggerScan = useCallback((endpointId: string, type: 'vulnerability' | 'patch' | 'full') => {
    const target = rawEndpoints.find(e => e.id === endpointId);
    if (target) {
      addToast('Agent Scan Triggered', `Initiated ${type.toUpperCase()} scan job on ${target.hostname}`, 'info');
      recordAudit(`Agent ${type} Scan`, `Endpoint ${target.hostname}`, 'State: Idle', `State: Scanning (${type})`);
      setTimeout(() => {
        addToast('Scan Completed', `Scan on ${target.hostname} completed. Inventory and risk score refreshed.`, 'success');
      }, 3000);
    }
  }, [rawEndpoints, recordAudit, addToast]);

  const rebootEndpoint = useCallback((endpointId: string) => {
    const target = rawEndpoints.find(e => e.id === endpointId);
    if (target) {
      setRawEndpoints(prev => prev.map(ep => ep.id === endpointId ? { ...ep, rebootPending: false } : ep));
      recordAudit('Endpoint Reboot Executed', `Endpoint ${target.hostname}`, 'Reboot: Pending', 'Reboot: Completed');
      addToast('Reboot Signal Dispatched', `Graceful reboot command acknowledged by ${target.hostname}`, 'warning');
    }
  }, [rawEndpoints, recordAudit, addToast]);

  // Patch Deployment
  const deployPatch = useCallback((patchId: string, endpointId?: string) => {
    const targetPatch = rawPatches.find(p => p.id === patchId);
    if (!targetPatch) return;

    const newJob: PatchDeploymentJob = {
      id: `job-${Math.floor(Math.random() * 900) + 100}`,
      patchId: targetPatch.id,
      patchTitle: targetPatch.title,
      targetCount: endpointId ? 1 : targetPatch.applicableEndpointsCount,
      progressPercent: 15,
      stage: 'Downloading',
      startedAt: 'Just now',
      successfulCount: 0,
      failedCount: 0,
      organizationId: selectedOrgId === 'all' ? 'org-1' : selectedOrgId
    };

    setDeploymentJobs(prev => [newJob, ...prev]);
    recordAudit('Patch Deployment Scheduled', `Patch ${targetPatch.kbOrId} (${targetPatch.title})`, 'Status: Approved', 'Status: Deployed (In Progress)');
    addToast('Patch Deployment Dispatched', `Deployment job ${newJob.id} started for ${targetPatch.kbOrId}`, 'info');

    // Simulate progress stages
    setTimeout(() => {
      setDeploymentJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, stage: 'Installing', progressPercent: 65 } : j));
    }, 2000);

    setTimeout(() => {
      setDeploymentJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, stage: 'Completed', progressPercent: 100, successfulCount: j.targetCount, completedAt: 'Just now' } : j));
      setRawPatches(prev => prev.map(p => p.id === patchId ? { ...p, status: 'Deployed' } : p));
      addToast('Patch Deployment Verified', `${targetPatch.kbOrId} successfully installed across all target endpoints.`, 'success');
    }, 4500);
  }, [rawPatches, selectedOrgId, recordAudit, addToast]);

  // Vulnerability Remediation
  const remediateVulnerability = useCallback((vulnId: string) => {
    const vuln = rawVulnerabilities.find(v => v.id === vulnId);
    if (!vuln) return;
    setVulnerabilities(prev => prev.map(v => v.id === vulnId ? { ...v, remediationStatus: 'In Progress' } : v));
    recordAudit('Remediation Workflow Initiated', `Vulnerability ${vuln.cve} (${vuln.title})`, `Status: ${vuln.remediationStatus}`, 'Status: In Progress');
    addToast('Remediation Plan Activated', `Patch and hardening playbook queued for ${vuln.cve}`, 'info');

    setTimeout(() => {
      setVulnerabilities(prev => prev.map(v => v.id === vulnId ? { ...v, remediationStatus: 'Remediated' } : v));
      addToast('Remediation Verified', `${vuln.cve} successfully remediated across affected assets.`, 'success');
    }, 3500);
  }, [rawVulnerabilities, recordAudit, addToast]);

  // SOC Alerts
  const updateAlertStatus = useCallback((alertId: string, status: SOCAlert['status']) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status } : a));
    const target = rawAlerts.find(a => a.id === alertId);
    if (target) {
      recordAudit('SOC Alert Status Updated', `Alert ${alertId} (${target.title})`, `Status: ${target.status}`, `Status: ${status}`);
      addToast('Alert Updated', `Alert ${alertId} marked as ${status}`, 'info');
    }
  }, [rawAlerts, recordAudit, addToast]);

  const escalateAlertToIncident = useCallback((alertId: string) => {
    const target = rawAlerts.find(a => a.id === alertId);
    if (!target) return;

    const newIncident: SOCIncident = {
      id: `INC-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      organizationId: target.organizationId || (selectedOrgId === 'all' ? 'org-1' : selectedOrgId),
      title: `Escalated: ${target.title}`,
      severity: target.severity === 'Info' ? 'Low' : target.severity,
      status: 'Investigating',
      assignedAnalyst: currentUser.name,
      leadInvestigator: currentUser.name,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      affectedAssets: [`${target.hostname} (${target.ipAddress})`],
      affectedUsers: [target.user],
      alertIds: [alertId],
      summary: `Automated incident creation triggered by SOC analyst during triage of alert "${target.title}". ${target.description}`,
      mitreTechniques: [target.mitreTechnique],
      timeline: [
        { time: 'Just now', action: `Incident created from Alert ${alertId}`, author: currentUser.name }
      ],
      notes: [
        { id: `note-${Date.now()}`, time: 'Just now', author: currentUser.name, text: `Initial triage confirmed high risk. Evidence: ${target.evidence.join('; ')}` }
      ],
      remediationTasks: [
        { id: 't1', task: `Isolate affected host ${target.hostname}`, done: false, requiredRole: 'SOC Admin' },
        { id: 't2', task: 'Perform memory artifact triage', done: false, requiredRole: 'Security Analyst' },
        { id: 't3', task: 'Revoke compromised credentials', done: false, requiredRole: 'IT Admin' }
      ]
    };

    setIncidents(prev => [newIncident, ...prev]);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Investigating' } : a));
    recordAudit('Alert Escalated to Incident', `Incident ${newIncident.id} from Alert ${alertId}`, 'State: Unassigned Alert', `Incident: ${newIncident.id}`);
    addToast('Incident Created', `Escalated alert to Incident ${newIncident.id}`, 'warning');
    setActiveNav('incidents');
    setSelectedIncident(newIncident);
  }, [rawAlerts, selectedOrgId, currentUser, recordAudit, addToast]);

  // Incidents
  const updateIncidentStatus = useCallback((incidentId: string, status: SOCIncident['status']) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status, updatedAt: 'Just now' } : inc));
    recordAudit('Incident Lifecycle Updated', `Incident ${incidentId}`, 'Previous Status', `Status: ${status}`);
    addToast('Incident Status Updated', `${incidentId} transition to ${status}`, 'info');
  }, [recordAudit, addToast]);

  const addIncidentNote = useCallback((incidentId: string, text: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newNote = {
          id: `note-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          author: currentUser.name,
          text
        };
        const newTimeline = {
          time: 'Just now',
          action: `Investigation note added by ${currentUser.name}`,
          author: currentUser.name
        };
        return {
          ...inc,
          notes: [...inc.notes, newNote],
          timeline: [...inc.timeline, newTimeline],
          updatedAt: 'Just now'
        };
      }
      return inc;
    }));
    addToast('War Room Note Added', 'Investigation note logged to case file.', 'success');
  }, [currentUser, addToast]);

  const toggleIncidentTask = useCallback((incidentId: string, taskId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          remediationTasks: inc.remediationTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
        };
      }
      return inc;
    }));
  }, []);

  // Custom Rules
  const saveCustomRule = useCallback((rule: CustomRule) => {
    setCustomRules(prev => {
      const exists = prev.find(r => r.id === rule.id);
      if (exists) {
        return prev.map(r => r.id === rule.id ? rule : r);
      }
      return [rule, ...prev];
    });
    recordAudit('Custom Security Rule Saved', `Rule: ${rule.name}`, 'Config updated', `Mode: ${rule.mode}, Trigger: ${rule.triggerType}`);
    addToast('Rule Saved', `Rule "${rule.name}" has been compiled and saved.`, 'success');
  }, [recordAudit, addToast]);

  const toggleCustomRule = useCallback((ruleId: string) => {
    setCustomRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const next = !r.enabled;
        recordAudit('Rule State Toggled', `Rule ${r.name}`, `Enabled: ${r.enabled}`, `Enabled: ${next}`);
        return { ...r, enabled: next };
      }
      return r;
    }));
  }, [recordAudit]);

  const testCustomRule = useCallback((rule: CustomRule): { matchCount: number; matchedEndpoints: Endpoint[] } => {
    // Evaluator against active tenant endpoints
    const matched = endpoints.filter(ep => {
      const conditionResults = rule.conditions.map(c => {
        let val: any = undefined;
        if (c.category === 'endpoint') {
          val = (ep as any)[c.field];
        } else if (c.category === 'security') {
          val = (ep as any)[c.field];
        } else if (c.category === 'patch') {
          val = (ep as any)[c.field];
        } else if (c.category === 'hardware') {
          val = (ep as any)[c.field];
        }

        if (c.operator === 'equals') return String(val).toLowerCase() === c.value.toLowerCase();
        if (c.operator === 'not_equals') return String(val).toLowerCase() !== c.value.toLowerCase();
        if (c.operator === 'greater_than') return Number(val) > Number(c.value);
        if (c.operator === 'less_than') return Number(val) < Number(c.value);
        if (c.operator === 'is_true') return val === true;
        if (c.operator === 'is_false') return val === false;
        if (c.operator === 'in_list') {
          const list = c.value.split(',').map(s => s.trim().toLowerCase());
          return list.includes(String(val).toLowerCase());
        }
        return true;
      });

      if (rule.matchLogic === 'ALL') {
        return conditionResults.every(Boolean);
      } else {
        return conditionResults.some(Boolean);
      }
    });

    return {
      matchCount: matched.length,
      matchedEndpoints: matched
    };
  }, [endpoints]);

  // Remote Terminal execution simulation
  const executeRemoteCommand = useCallback(async (endpointId: string, command: string): Promise<string> => {
    const target = rawEndpoints.find(e => e.id === endpointId);
    if (!target) return 'Error: Target endpoint unreachable.';

    recordAudit('Remote Terminal Command Executed', `Endpoint ${target.hostname}`, 'Command execution', command);

    await new Promise(r => setTimeout(r, 600));

    const cmd = command.trim().toLowerCase();
    if (cmd === 'whoami') {
      return target.osPlatform === 'windows' ? 'NT AUTHORITY\\SYSTEM' : 'root';
    }
    if (cmd === 'hostname') {
      return target.hostname;
    }
    if (cmd.startsWith('ipconfig') || cmd.startsWith('ifconfig') || cmd.startsWith('ip addr')) {
      return `IPv4 Address. . . . . . . . . . . : ${target.ipAddress}\nSubnet Mask . . . . . . . . . . . : 255.255.255.0\nDefault Gateway . . . . . . . . . : 10.240.1.1\nMAC Address . . . . . . . . . . . : ${target.macAddress}\nPublic Ingress IP . . . . . . . . : ${target.publicIp || 'None (Internal Private Subnet)'}`;
    }
    if (cmd.startsWith('netstat') || cmd.startsWith('ss -tulpn')) {
      return `Proto  Local Address          Foreign Address        State        PID/Program\nTCP    0.0.0.0:1433           0.0.0.0:0              LISTENING    3840/sqlservr.exe\nTCP    0.0.0.0:3389           0.0.0.0:0              LISTENING    1204/svchost.exe\nTCP    ${target.ipAddress}:49812      185.220.101.5:4444     ESTABLISHED  5120/powershell.exe [ALERT]\nTCP    127.0.0.1:8080         0.0.0.0:0              LISTENING    912/agent_vanguard`;
    }
    if (cmd.startsWith('ps aux') || cmd.startsWith('tasklist')) {
      return `PID   USER      %CPU  %MEM  COMMAND\n4     SYSTEM    0.0   0.1   System\n912   SYSTEM    0.8   1.2   vanguard_agent_daemon\n1204  SYSTEM    0.1   0.8   svchost.exe -k termsvcs\n3840  SYSTEM    4.2   28.4  sqlservr.exe\n5120  SYSTEM    12.8  3.4   powershell.exe -NoP -NonI -W Hidden [SUSPICIOUS]`;
    }
    if (cmd.startsWith('patch check') || cmd.startsWith('wuauclt')) {
      return `[VANGUARD PATCH AGENT v4.9.0]\nChecking Microsoft Update Catalog & Third-Party Repositories...\nFound ${target.missingPatchesCount} missing updates (${target.criticalPatchesCount} Critical Severity).\nPending Reboot Flag: ${target.rebootPending ? 'TRUE (Reboot Required)' : 'FALSE'}`;
    }
    if (cmd.startsWith('isolate') || cmd.startsWith('quarantine')) {
      isolateEndpoint(endpointId);
      return `[SUCCESS] Host network isolation enacted via Windows Filtering Platform (WFP). All egress TCP/UDP dropped except Vanguard Agent TLS C2 port.`;
    }
    if (cmd.startsWith('help')) {
      return `Available Diagnostic & Remediation Commands:\n  whoami             Display current execution privilege\n  hostname           Display target machine hostname\n  ipconfig / ifconfig Display network adapter interfaces\n  netstat            Inspect active listening ports and connections\n  ps aux / tasklist  List active processes and CPU/RAM consumption\n  patch check        Evaluate pending patches and reboot requirements\n  isolate            Trigger immediate emergency network quarantine\n  clear              Clear terminal console screen`;
    }

    return `Executed: "${command}" (Exit Code: 0)\nCommand acknowledged by Vanguard Agent daemon at ${new Date().toISOString()}`;
  }, [rawEndpoints, recordAudit, isolateEndpoint]);

  // -------------------------------------------------------------
  // SCHEDULED REPORTING ACTIONS
  // -------------------------------------------------------------
  const addReportSchedule = useCallback((scheduleData: Partial<ReportSchedule>) => {
    const newSchedule: ReportSchedule = {
      id: `sched-${Date.now().toString(36)}`,
      name: scheduleData.name || 'Automated Compliance Report',
      organizationId: scheduleData.organizationId || selectedOrgId,
      reportType: scheduleData.reportType || 'executive',
      frequency: scheduleData.frequency || 'Weekly',
      timeUtc: scheduleData.timeUtc || '08:00 UTC',
      formats: scheduleData.formats || ['PDF', 'EXCEL'],
      recipients: scheduleData.recipients || [currentUser.email],
      destinations: scheduleData.destinations || ['email'],
      status: 'Active',
      nextRun: 'Tomorrow at 08:00 UTC',
      executionCount: 0
    };

    setReportSchedules(prev => [newSchedule, ...prev]);
    recordAudit('Report Schedule Configured', `Schedule: ${newSchedule.name}`, 'None', `Frequency: ${newSchedule.frequency}, Formats: ${newSchedule.formats.join(',')}`);
    addToast('Report Schedule Created', `Automated job "${newSchedule.name}" active.`, 'success');
  }, [selectedOrgId, currentUser, recordAudit, addToast]);

  const deleteReportSchedule = useCallback((id: string) => {
    setReportSchedules(prev => prev.filter(s => s.id !== id));
    addToast('Schedule Removed', 'Automated report schedule deleted.', 'info');
  }, [addToast]);

  const toggleReportSchedule = useCallback((id: string) => {
    setReportSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const next = s.status === 'Active' ? 'Paused' : 'Active';
        return { ...s, status: next };
      }
      return s;
    }));
  }, []);

  const triggerReportNow = useCallback((scheduleId?: string, reportType?: string, format: 'PDF' | 'DOC' | 'EXCEL' | 'CSV' | 'JSON' = 'PDF') => {
    const orgName = currentOrg.name;
    const typeLabel = reportType || 'Executive Cybersecurity Posture';
    
    const newLog: ReportExecutionLog = {
      id: `log-rpt-${Date.now().toString(36)}`,
      scheduleId,
      scheduleName: scheduleId ? (rawReportSchedules.find(s => s.id === scheduleId)?.name || 'Custom Run') : `Manual Trigger: ${typeLabel}`,
      organizationName: orgName,
      reportType: typeLabel,
      format,
      generatedAt: 'Just now',
      fileSizeBytes: Math.floor(Math.random() * 2000000) + 500000,
      status: 'Delivered',
      recipientCount: 1
    };

    setReportLogs(prev => [newLog, ...prev]);
    addToast('Automated Report Dispatched', `Generated and delivered ${format} format to compliance distribution pipeline.`, 'success');
  }, [currentOrg, rawReportSchedules, addToast]);

  // -------------------------------------------------------------
  // RBAC & CUSTOM ROLE ACTIONS
  // -------------------------------------------------------------
  const addCustomRole = useCallback((roleData: Partial<CustomRole>): CustomRole => {
    const newId = `role-${Date.now().toString(36)}`;
    const newRole: CustomRole = {
      id: newId,
      name: roleData.name?.trim() || 'Custom Security Role',
      description: roleData.description?.trim() || 'Custom security operations role with tailored granular permissions.',
      isSystem: false,
      color: roleData.color || 'blue',
      scope: roleData.scope || 'Tenant Scoped',
      permissions: roleData.permissions || [],
      assignedUsersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: `${currentUser.name} (${currentUser.role})`
    };

    setRoles(prev => [...prev, newRole]);
    recordAuditLog({
      category: 'Access & RBAC',
      action: 'Custom RBAC Role Created',
      object: `Role: ${newRole.name} (${newRole.id})`,
      previousValue: 'None',
      newValue: `Scope: ${newRole.scope}, Permissions: ${newRole.permissions.length} granted`,
      diffSummary: `+ Created custom role "${newRole.name}" with ${newRole.permissions.length} capabilities`,
      result: 'Success',
      severity: 'Info'
    });
    addToast('Custom Role Created', `Defined "${newRole.name}" with ${newRole.permissions.length} permissions.`, 'success');
    return newRole;
  }, [currentUser, recordAuditLog, addToast]);

  const updateCustomRole = useCallback((roleId: string, updates: Partial<CustomRole>) => {
    const existing = roles.find(r => r.id === roleId);
    if (!existing) return;

    const oldName = existing.name;
    const newName = updates.name?.trim() || existing.name;

    const updatedRole: CustomRole = {
      ...existing,
      ...updates,
      name: newName,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setRoles(prev => prev.map(r => r.id === roleId ? updatedRole : r));

    // If role name changed, update any users assigned to this role
    if (oldName !== newName) {
      setSystemUsers(prev => prev.map(u => u.role === oldName ? { ...u, role: newName } : u));
      if (currentUser.role === oldName) {
        setCurrentUser(prev => ({ ...prev, role: newName }));
      }
    }

    recordAuditLog({
      category: 'Access & RBAC',
      action: 'RBAC Role Permissions Modified',
      object: `Role: ${existing.name} (${existing.id})`,
      previousValue: `Permissions: ${existing.permissions.length} granted, Scope: ${existing.scope}`,
      newValue: `Permissions: ${updatedRole.permissions.length} granted, Scope: ${updatedRole.scope}`,
      diffSummary: `~ Updated role definition for "${updatedRole.name}" (${updatedRole.permissions.length} permissions active)`,
      result: 'Success',
      severity: 'Medium'
    });
    addToast('Role Updated', `Modifications saved to "${updatedRole.name}".`, 'success');
  }, [roles, currentUser, recordAuditLog, addToast]);

  const cloneCustomRole = useCallback((roleId: string, newName?: string): CustomRole => {
    const source = roles.find(r => r.id === roleId);
    const targetName = newName?.trim() || `${source?.name || 'Custom'} (Copy)`;
    const newId = `role-${Date.now().toString(36)}`;

    const cloned: CustomRole = {
      id: newId,
      name: targetName,
      description: `Cloned from ${source?.name || 'template'}. ${source?.description || ''}`,
      isSystem: false,
      color: source?.color === 'purple' ? 'indigo' : (source?.color || 'indigo'),
      scope: source?.scope || 'Tenant Scoped',
      permissions: source ? [...source.permissions] : [],
      assignedUsersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: `${currentUser.name} (${currentUser.role})`
    };

    setRoles(prev => [...prev, cloned]);
    recordAuditLog({
      category: 'Access & RBAC',
      action: 'RBAC Role Cloned',
      object: `Cloned: ${source?.name || roleId} -> ${cloned.name}`,
      previousValue: source ? `Source Permissions: ${source.permissions.length}` : 'None',
      newValue: `Permissions: ${cloned.permissions.length}, New Role ID: ${cloned.id}`,
      diffSummary: `+ Cloned role "${source?.name}" to create "${cloned.name}" with ${cloned.permissions.length} capabilities`,
      result: 'Success',
      severity: 'Info'
    });
    addToast('Role Cloned', `Created "${cloned.name}" from template.`, 'success');
    return cloned;
  }, [roles, currentUser, recordAuditLog, addToast]);

  const deleteCustomRole = useCallback((roleId: string): boolean => {
    const target = roles.find(r => r.id === roleId);
    if (!target) return false;
    if (target.isSystem) {
      addToast('Deletion Prohibited', `Cannot delete built-in system role "${target.name}".`, 'error');
      return false;
    }
    const hasAssignedUsers = systemUsers.some(u => u.role === target.name);
    if (hasAssignedUsers) {
      addToast('Deletion Prohibited', `Cannot delete "${target.name}" because operators are currently assigned to this role. Please reassign them first.`, 'warning');
      return false;
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    recordAuditLog({
      category: 'Access & RBAC',
      action: 'Custom RBAC Role Deleted',
      object: `Role: ${target.name} (${target.id})`,
      previousValue: `Permissions: ${target.permissions.length}, Scope: ${target.scope}`,
      newValue: 'DELETED',
      diffSummary: `- Removed custom role "${target.name}"`,
      result: 'Success',
      severity: 'Warning'
    });
    addToast('Role Deleted', `Custom role "${target.name}" has been deleted.`, 'info');
    return true;
  }, [roles, systemUsers, recordAuditLog, addToast]);

  const addSystemUser = useCallback((userData: Partial<User>): User => {
    const newId = `u-${Date.now().toString(36)}`;
    const initials = (userData.name || 'US')
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const assignedOrg = userData.organizationName || (selectedOrgId === 'all' ? 'All Organizations (MSP)' : currentOrg.name);
    const assignedOrgId = userData.organizationId || selectedOrgId;

    const newUser: User = {
      id: newId,
      name: userData.name?.trim() || 'New Operator',
      email: userData.email?.trim() || `operator@${currentOrg.domain || 'vanguardops.io'}`,
      role: userData.role || 'Security Analyst',
      avatar: initials,
      organizationId: assignedOrgId,
      organizationName: assignedOrg,
      mfaEnabled: userData.mfaEnabled !== undefined ? userData.mfaEnabled : true,
      lastLogin: 'Never',
      status: userData.status || 'Active'
    };

    setSystemUsers(prev => [newUser, ...prev]);

    // Update role assigned users count
    setRoles(prev => prev.map(r => r.name === newUser.role ? { ...r, assignedUsersCount: r.assignedUsersCount + 1 } : r));

    recordAuditLog({
      category: 'Access & RBAC',
      action: 'System User Provisioned',
      object: `User: ${newUser.name} (${newUser.email})`,
      previousValue: 'None',
      newValue: `Role: ${newUser.role}, Scope: ${newUser.organizationName}, MFA: ${newUser.mfaEnabled}`,
      diffSummary: `+ User account provisioned with role "${newUser.role}"`,
      result: 'Success',
      severity: 'Info'
    });
    addToast('Operator Provisioned', `Added ${newUser.name} as ${newUser.role}.`, 'success');
    return newUser;
  }, [currentOrg, selectedOrgId, recordAuditLog, addToast]);

  const updateSystemUser = useCallback((userId: string, updates: Partial<User>) => {
    const existing = systemUsers.find(u => u.id === userId);
    if (!existing) return;

    const oldRole = existing.role;
    const newRole = updates.role || existing.role;

    const updated = { ...existing, ...updates };
    setSystemUsers(prev => prev.map(u => u.id === userId ? updated : u));

    if (currentUser.id === userId || currentUser.email === existing.email) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }

    // Update counts if role changed
    if (oldRole !== newRole) {
      setRoles(prev => prev.map(r => {
        if (r.name === oldRole) return { ...r, assignedUsersCount: Math.max(0, r.assignedUsersCount - 1) };
        if (r.name === newRole) return { ...r, assignedUsersCount: r.assignedUsersCount + 1 };
        return r;
      }));
    }

    recordAuditLog({
      category: 'Access & RBAC',
      action: 'User Profile & Authorization Updated',
      object: `User: ${existing.name} (${existing.email})`,
      previousValue: `Role: ${oldRole}, MFA: ${existing.mfaEnabled}`,
      newValue: `Role: ${newRole}, MFA: ${updated.mfaEnabled}`,
      diffSummary: `~ Updated user ${existing.name}: Role ${oldRole} -> ${newRole}`,
      result: 'Success',
      severity: 'Medium'
    });
    addToast('User Updated', `Changes to ${updated.name} saved.`, 'success');
  }, [systemUsers, currentUser, recordAuditLog, addToast]);

  const deleteSystemUser = useCallback((userId: string) => {
    const target = systemUsers.find(u => u.id === userId);
    if (!target) return;
    if (systemUsers.length <= 1) {
      addToast('Action Prohibited', 'Cannot delete the only remaining administrator account.', 'error');
      return;
    }

    setSystemUsers(prev => prev.filter(u => u.id !== userId));
    setRoles(prev => prev.map(r => r.name === target.role ? { ...r, assignedUsersCount: Math.max(0, r.assignedUsersCount - 1) } : r));

    recordAuditLog({
      category: 'Access & RBAC',
      action: 'System User Deactivated',
      object: `User: ${target.name} (${target.email})`,
      previousValue: `Role: ${target.role}, MFA: ${target.mfaEnabled}`,
      newValue: 'DELETED',
      diffSummary: `- Removed user account ${target.name}`,
      result: 'Success',
      severity: 'Warning'
    });
    addToast('User Removed', `Account ${target.name} deleted.`, 'info');
  }, [systemUsers, recordAuditLog, addToast]);

  return (
    <AppContext.Provider
      value={{
        currentOrg,
        selectedOrgId,
        organizations,
        switchOrg,
        addOrganization,
        deleteOrganization,
        updateOrganization,
        recordAuditLog,
        currentUser,
        setUserRole,
        theme,
        toggleTheme,
        activeNav,
        setActiveNav,
        activeSubTab,
        setActiveSubTab,
        endpoints,
        sites,
        patches,
        patchPolicies,
        deploymentJobs,
        vulnerabilities,
        securityEvents,
        alerts,
        incidents,
        customRules,
        workflows,
        auditLogs,
        reportSchedules,
        reportLogs,
        roles,
        systemUsers,
        systemPermissions: SYSTEM_PERMISSIONS,
        addCustomRole,
        updateCustomRole,
        deleteCustomRole,
        cloneCustomRole,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,
        selectedEndpoint,
        setSelectedEndpoint,
        selectedAlert,
        setSelectedAlert,
        selectedIncident,
        setSelectedIncident,
        isSearchOpen,
        setIsSearchOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isAgentInstallModalOpen,
        setIsAgentInstallModalOpen,
        registerEndpoint,
        isolateEndpoint,
        unisolateEndpoint,
        triggerScan,
        rebootEndpoint,
        deployPatch,
        remediateVulnerability,
        updateAlertStatus,
        escalateAlertToIncident,
        updateIncidentStatus,
        addIncidentNote,
        toggleIncidentTask,
        saveCustomRule,
        toggleCustomRule,
        testCustomRule,
        executeRemoteCommand,
        addReportSchedule,
        deleteReportSchedule,
        toggleReportSchedule,
        triggerReportNow,
        isLiveSimulationActive,
        toggleLiveSimulation,
        eventsCountToday,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
