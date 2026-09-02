import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserPlus,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Check,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Server,
  Bug,
  PackageCheck,
  Radio,
  FileText,
  Building2,
  Cpu,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomRole, SystemPermission, User, PermissionModule } from '../../types';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportToCSV, exportToPDF, exportToExcel, exportToDocument, exportToJSON } from '../../utils/exportUtils';

export const RBACManagement: React.FC = () => {
  const {
    roles,
    systemUsers,
    systemPermissions,
    organizations,
    currentOrg,
    selectedOrgId,
    addCustomRole,
    updateCustomRole,
    deleteCustomRole,
    cloneCustomRole,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    setUserRole,
    currentUser,
    addToast
  } = useApp();

  const [subTab, setSubTab] = useState<'roles' | 'users' | 'matrix'>('roles');
  
  // Search and filters
  const [roleSearch, setRoleSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userOrgFilter, setUserOrgFilter] = useState('all');
  const [permSearch, setPermSearch] = useState('');
  const [permModuleFilter, setPermModuleFilter] = useState<string>('all');

  // Modals & Drawers
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [cloningRole, setCloningRole] = useState<CustomRole | null>(null);
  const [cloneName, setCloneName] = useState('');

  // Role Form State
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleScope, setRoleScope] = useState<'Global MSP' | 'Tenant Scoped' | 'Site Specific'>('Tenant Scoped');
  const [roleColor, setRoleColor] = useState<string>('blue');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'Fleet & Endpoints': true,
    'SOC & Incident Response': true,
    'Patch Management': true,
    'Vulnerabilities & CVEs': true,
    'Detection & Sigma Rules': true,
    'Threat Hunting & Forensics': true,
    'Automated Reports': true,
    'Tenant Management': true,
    'System & RBAC Governance': true
  });

  // User Management Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);

  // User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRoleState] = useState<string>('Security Analyst');
  const [userOrg, setUserOrg] = useState<string>(organizations[0]?.name || 'All Organizations (MSP)');
  const [userOrgId, setUserOrgId] = useState<string>(organizations[0]?.id || 'all');
  const [userMfa, setUserMfa] = useState<boolean>(true);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const map: Record<string, SystemPermission[]> = {};
    systemPermissions.forEach(p => {
      if (!map[p.module]) {
        map[p.module] = [];
      }
      map[p.module].push(p);
    });
    return map;
  }, [systemPermissions]);

  const modulesList = Object.keys(permissionsByModule);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      if (!roleSearch.trim()) return true;
      const q = roleSearch.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.scope.toLowerCase().includes(q);
    });
  }, [roles, roleSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return systemUsers.filter(u => {
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchesQuery = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.organizationName && u.organizationName.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userOrgFilter !== 'all' && u.organizationId !== userOrgFilter && u.organizationName !== userOrgFilter) return false;
      return true;
    });
  }, [systemUsers, userSearch, userRoleFilter, userOrgFilter]);

  // Filtered Permissions for Matrix
  const filteredPermissions = useMemo(() => {
    return systemPermissions.filter(p => {
      if (permModuleFilter !== 'all' && p.module !== permModuleFilter) return false;
      if (permSearch.trim()) {
        const q = permSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [systemPermissions, permModuleFilter, permSearch]);

  // Handle open create role
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setRoleScope('Tenant Scoped');
    setRoleColor('blue');
    setSelectedPermissions([
      'endpoints.view',
      'vulns.view',
      'patches.view',
      'soc.alerts_view',
      'reports.view',
      'reports.generate'
    ]);
    setIsRoleModalOpen(true);
  };

  // Handle open edit role
  const handleOpenEditRole = (role: CustomRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setRoleScope(role.scope);
    setRoleColor(role.color);
    setSelectedPermissions([...role.permissions]);
    setIsRoleModalOpen(true);
  };

  // Handle open clone role
  const handleOpenCloneRole = (role: CustomRole) => {
    setCloningRole(role);
    setCloneName(`${role.name} (Custom Copy)`);
  };

  // Submit Clone Role
  const handleConfirmCloneRole = () => {
    if (!cloningRole) return;
    if (!cloneName.trim()) {
      addToast('Validation Error', 'Role name cannot be blank.', 'error');
      return;
    }
    cloneCustomRole(cloningRole.id, cloneName.trim());
    setCloningRole(null);
    setCloneName('');
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (key: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Toggle all permissions for a module
  const handleToggleModulePermissions = (module: string) => {
    const permsInModule = permissionsByModule[module] || [];
    const keys = permsInModule.map(p => p.key);
    const allSelected = keys.every(k => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(k => !keys.includes(k)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...keys])));
    }
  };

  // Quick Presets
  const applyPreset = (preset: 'all' | 'readonly' | 'soc' | 'it' | 'clear') => {
    if (preset === 'all') {
      setSelectedPermissions(systemPermissions.map(p => p.key));
    } else if (preset === 'clear') {
      setSelectedPermissions([]);
    } else if (preset === 'readonly') {
      setSelectedPermissions([
        'endpoints.view',
        'vulns.view',
        'patches.view',
        'soc.alerts_view',
        'rules.view',
        'mitre.matrix_view',
        'reports.view',
        'reports.generate',
        'tenants.view',
        'admin.audit_inspect'
      ]);
    } else if (preset === 'soc') {
      setSelectedPermissions([
        'endpoints.view', 'endpoints.isolate', 'endpoints.script_exec',
        'vulns.view', 'vulns.scan_trigger',
        'patches.view',
        'soc.alerts_view', 'soc.alerts_triage', 'soc.incident_manage', 'soc.playbook_exec', 'soc.forensic_dump',
        'rules.view', 'rules.create',
        'hunting.query_exec', 'hunting.save_queries', 'mitre.matrix_view',
        'reports.view', 'reports.generate',
        'tenants.view'
      ]);
    } else if (preset === 'it') {
      setSelectedPermissions([
        'endpoints.view', 'endpoints.reboot', 'endpoints.agent_deploy', 'endpoints.script_exec',
        'vulns.view',
        'patches.view', 'patches.approve', 'patches.deploy', 'patches.policy_edit', 'patches.rollback',
        'reports.view', 'reports.generate', 'reports.schedule_edit',
        'tenants.view'
      ]);
    }
  };

  // Save Role
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      addToast('Validation Error', 'Role Name is required.', 'error');
      return;
    }

    if (selectedPermissions.length === 0) {
      addToast('Validation Error', 'Please select at least one permission capability.', 'error');
      return;
    }

    if (editingRole) {
      updateCustomRole(editingRole.id, {
        name: roleName.trim(),
        description: roleDescription.trim(),
        scope: roleScope,
        color: roleColor,
        permissions: selectedPermissions
      });
    } else {
      addCustomRole({
        name: roleName.trim(),
        description: roleDescription.trim(),
        scope: roleScope,
        color: roleColor,
        permissions: selectedPermissions
      });
    }

    setIsRoleModalOpen(false);
  };

  // Delete Role
  const handleConfirmDeleteRole = () => {
    if (!deletingRoleId) return;
    deleteCustomRole(deletingRoleId);
    setDeletingRoleId(null);
  };

  // User Management
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserRoleState(roles[0]?.name || 'Security Analyst');
    setUserOrg(organizations[0]?.name || 'All Organizations (MSP)');
    setUserOrgId(organizations[0]?.id || 'all');
    setUserMfa(true);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRoleState(user.role);
    setUserOrg(user.organizationName || 'All Organizations (MSP)');
    setUserOrgId(user.organizationId);
    setUserMfa(user.mfaEnabled);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      addToast('Validation Error', 'Name and Email are required.', 'error');
      return;
    }

    if (editingUser) {
      updateSystemUser(editingUser.id, {
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        organizationName: userOrg,
        organizationId: userOrgId,
        mfaEnabled: userMfa
      });
    } else {
      addSystemUser({
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        organizationName: userOrg,
        organizationId: userOrgId,
        mfaEnabled: userMfa
      });
    }

    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUserId) return;
    deleteSystemUser(deletingUserId);
    setDeletingUserId(null);
  };

  // Get color styles for role badges
  const getRoleBadgeClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'rose':
      case 'red':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'amber':
      case 'orange':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'emerald':
      case 'green':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'indigo':
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Get module icon
  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'Fleet & Endpoints':
        return <Server className="w-4 h-4 text-blue-500" />;
      case 'Vulnerabilities & CVEs':
        return <Bug className="w-4 h-4 text-amber-500" />;
      case 'Patch Management':
        return <PackageCheck className="w-4 h-4 text-emerald-500" />;
      case 'SOC & Incident Response':
        return <Radio className="w-4 h-4 text-rose-500" />;
      case 'Detection & Sigma Rules':
        return <Sliders className="w-4 h-4 text-purple-500" />;
      case 'Threat Hunting & Forensics':
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case 'Automated Reports':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'Tenant Management':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'System & RBAC Governance':
        return <ShieldCheck className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-150">
      {/* RBAC Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Role-Based Access Control (RBAC) Governance
            </h3>
            <p className="text-[11px] text-slate-400">
              Define custom authorization roles, fine-tune granular permission matrices, and enforce multi-tenant privilege boundaries.
            </p>
          </div>
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
          <button
            id="rbac-subtab-roles"
            onClick={() => setSubTab('roles')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'roles'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Custom Roles ({roles.length})</span>
          </button>

          <button
            id="rbac-subtab-users"
            onClick={() => setSubTab('users')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts ({systemUsers.length})</span>
          </button>

          <button
            id="rbac-subtab-matrix"
            onClick={() => setSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Permissions Matrix ({systemPermissions.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VIEW 1: CUSTOM ROLES & DEFINITIONS */}
      {/* ============================================================= */}
      {subTab === 'roles' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                placeholder="Search roles by title, scope, or capability..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <ExportDropdown
                label="Export RBAC Schema"
                entityName="Roles & Permissions"
                totalCount={roles.length}
                filteredCount={filteredRoles.length}
                onExportCSV={() => {
                  const headers = ['Role Name', 'Type', 'Scope', 'Granted Permissions Count', 'Assigned Operators', 'Last Updated'];
                  const rows = filteredRoles.map(r => [r.name, r.isSystem ? 'System Built-In' : 'Custom Defined', r.scope, `${r.permissions.length}/${systemPermissions.length}`, r.assignedUsersCount, r.updatedAt]);
                  exportToCSV({ filename: 'vanguard_rbac_roles', title: 'SOC Role-Based Access Control Schema', orgName: currentOrg.name, headers, rows });
                }}
                onExportPDF={() => {
                  const headers = ['Role Name', 'Scope', 'Permissions Count', 'Operators'];
                  const rows = filteredRoles.map(r => [r.name, r.scope, `${r.permissions.length} granted`, r.assignedUsersCount]);
                  exportToPDF({ filename: 'vanguard_rbac_roles', title: 'SOC RBAC Role Hierarchy & Authorization Report', orgName: currentOrg.name, headers, rows });
                }}
                onExportExcel={() => {
                  const headers = ['Role Name', 'Type', 'Scope', 'Permissions Count', 'Assigned Operators', 'Last Updated'];
                  const rows = filteredRoles.map(r => [r.name, r.isSystem ? 'Built-In' : 'Custom', r.scope, r.permissions.length, r.assignedUsersCount, r.updatedAt]);
                  exportToExcel({ filename: 'vanguard_rbac_roles', title: 'RBAC Authorization Roles', orgName: currentOrg.name, headers, rows });
                }}
                onExportDoc={() => {
                  const headers = ['Role Name', 'Scope', 'Permissions Count', 'Assigned Operators'];
                  const rows = filteredRoles.map(r => [r.name, r.scope, `${r.permissions.length} of ${systemPermissions.length}`, r.assignedUsersCount]);
                  exportToDocument({ filename: 'vanguard_rbac_governance_doc', title: 'SOC 2 RBAC Governance & Privilege Model', orgName: currentOrg.name, headers, rows });
                }}
                onExportJSON={() => {
                  exportToJSON('vanguard_rbac_roles', 'RBAC Roles Schema Export', currentOrg.name, roles);
                }}
              />

              <button
                id="create-custom-role-btn"
                onClick={handleOpenCreateRole}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Role</span>
              </button>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => {
              const coveragePct = Math.round((role.permissions.length / systemPermissions.length) * 100);
              const badgeClass = getRoleBadgeClasses(role.color);

              return (
                <div
                  key={role.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border font-mono ${badgeClass}`}>
                          {role.name}
                        </span>
                        {role.isSystem ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            System
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-900">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-medium">
                        {role.scope}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Permission Coverage Meter */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Permission Scope</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {role.permissions.length} / {systemPermissions.length} ({coveragePct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            coveragePct > 80 ? 'bg-purple-600' : coveragePct > 50 ? 'bg-blue-600' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${coveragePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata stats */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Operators</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {role.assignedUsersCount} active
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Updated</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono">
                          {role.updatedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      id={`clone-role-btn-${role.id}`}
                      onClick={() => handleOpenCloneRole(role)}
                      title="Clone this role as a template"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Clone</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-role-btn-${role.id}`}
                        onClick={() => handleOpenEditRole(role)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{role.isSystem ? 'View / Tune' : 'Edit Matrix'}</span>
                      </button>

                      {!role.isSystem && (
                        <button
                          id={`delete-role-btn-${role.id}`}
                          onClick={() => setDeletingRoleId(role.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                          title="Delete custom role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 2: USER DIRECTORY & ROLE ASSIGNMENTS */}
      {/* ============================================================= */}
      {subTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search operators by name or email..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 font-bold"
              >
                <option value="all">All Roles ({roles.length})</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>

              {/* Org Filter */}
              <select
                value={userOrgFilter}
                onChange={e => setUserOrgFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 font-bold"
              >
                <option value="all">All Tenant Scopes</option>
                <option value="all">All Organizations (MSP)</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ExportDropdown
                label="Export Users"
                entityName="Operator Accounts"
                totalCount={systemUsers.length}
                filteredCount={filteredUsers.length}
                onExportCSV={() => {
                  const headers = ['Name', 'Email', 'Role', 'Tenant Organization', 'MFA Status', 'Last Login'];
                  const rows = filteredUsers.map(u => [u.name, u.email, u.role, u.organizationName || u.organizationId, u.mfaEnabled ? 'Enforced' : 'Disabled', u.lastLogin]);
                  exportToCSV({ filename: 'vanguard_system_users', title: 'SOC User Directory & Roles', orgName: currentOrg.name, headers, rows });
                }}
                onExportPDF={() => {
                  const headers = ['Name', 'Email', 'Role', 'Tenant Scope', 'MFA'];
                  const rows = filteredUsers.map(u => [u.name, u.email, u.role, u.organizationName || u.organizationId, u.mfaEnabled ? 'Yes' : 'No']);
                  exportToPDF({ filename: 'vanguard_system_users', title: 'SOC User Authorization Audit', orgName: currentOrg.name, headers, rows });
                }}
                onExportExcel={() => {
                  const headers = ['Name', 'Email', 'Role', 'Tenant Organization', 'MFA', 'Last Login'];
                  const rows = filteredUsers.map(u => [u.name, u.email, u.role, u.organizationName || u.organizationId, u.mfaEnabled, u.lastLogin]);
                  exportToExcel({ filename: 'vanguard_system_users', title: 'SOC Operators & RBAC', orgName: currentOrg.name, headers, rows });
                }}
                onExportDoc={() => {
                  const headers = ['Name', 'Email', 'Role', 'Tenant Organization', 'MFA'];
                  const rows = filteredUsers.map(u => [u.name, u.email, u.role, u.organizationName || u.organizationId, u.mfaEnabled ? 'Enforced' : 'Not Enforced']);
                  exportToDocument({ filename: 'vanguard_users_doc', title: 'SOC Access Authorization Ledger', orgName: currentOrg.name, headers, rows });
                }}
                onExportJSON={() => {
                  exportToJSON('vanguard_users', 'SOC User Accounts Export', currentOrg.name, systemUsers);
                }}
              />

              <button
                id="add-operator-user-btn"
                onClick={handleOpenAddUser}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Operator</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="px-4 py-3">Operator Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Assigned Tenant Scope</th>
                  <th className="px-4 py-3">RBAC Role Assignment</th>
                  <th className="px-4 py-3">MFA Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(user => {
                  const assignedRoleObj = roles.find(r => r.name === user.role);
                  const isCurrent = currentUser.email === user.email;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                            {user.avatar || user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold px-1.5 py-0.2 rounded border border-blue-300 dark:border-blue-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {user.email}
                      </td>

                      {/* Tenant Scope */}
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.organizationName || 'All Organizations (MSP)'}</span>
                        </div>
                      </td>

                      {/* Role Dropdown / Badge */}
                      <td className="px-4 py-3">
                        <select
                          id={`user-role-select-${user.id}`}
                          value={user.role}
                          onChange={e => updateSystemUser(user.id, { role: e.target.value })}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                            getRoleBadgeClasses(assignedRoleObj?.color || 'blue')
                          }`}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.name}>
                              {r.name} {r.isSystem ? '(Built-in)' : '(Custom)'}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* MFA */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateSystemUser(user.id, { mfaEnabled: !user.mfaEnabled })}
                          title="Click to toggle MFA policy enforcement"
                          className="inline-flex items-center gap-1 cursor-pointer"
                        >
                          {user.mfaEnabled ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Enforced (FIDO2)
                            </span>
                          ) : (
                            <span className="text-amber-500 font-semibold flex items-center gap-1 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> Optional
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                        {user.lastLogin}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`inspect-user-perms-btn-${user.id}`}
                            onClick={() => setInspectingUser(user)}
                            title="Inspect effective permissions for this operator"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`edit-user-btn-${user.id}`}
                            onClick={() => handleOpenEditUser(user)}
                            title="Edit user profile"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`delete-user-btn-${user.id}`}
                            onClick={() => setDeletingUserId(user.id)}
                            title="Deactivate user"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* ============================================================= */}
      {/* VIEW 3: PERMISSIONS CATALOG & SECURITY MATRIX */}
      {/* ============================================================= */}
      {subTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filters & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={permSearch}
                  onChange={e => setPermSearch(e.target.value)}
                  placeholder="Search capabilities by name or key..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={permModuleFilter}
                onChange={e => setPermModuleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 font-bold"
              >
                <option value="all">All Modules ({modulesList.length})</option>
                {modulesList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <ExportDropdown
              label="Export Permission Matrix"
              entityName="Permissions"
              totalCount={systemPermissions.length}
              filteredCount={filteredPermissions.length}
              onExportCSV={() => {
                const headers = ['Permission Key', 'Name', 'Module', 'Risk Level', 'Requires MFA', 'Description'];
                const rows = filteredPermissions.map(p => [p.key, p.name, p.module, p.riskLevel, p.requiresMfa ? 'Yes' : 'No', p.description]);
                exportToCSV({ filename: 'vanguard_permissions_matrix', title: 'SOC Granular Permission Catalog', orgName: currentOrg.name, headers, rows });
              }}
              onExportPDF={() => {
                const headers = ['Key', 'Name', 'Module', 'Risk', 'MFA'];
                const rows = filteredPermissions.map(p => [p.key, p.name, p.module, p.riskLevel, p.requiresMfa ? 'Required' : 'No']);
                exportToPDF({ filename: 'vanguard_permissions_matrix', title: 'SOC 2 Type II Permissions Matrix Report', orgName: currentOrg.name, headers, rows });
              }}
              onExportExcel={() => {
                const headers = ['Key', 'Name', 'Module', 'Risk Level', 'MFA', 'Description'];
                const rows = filteredPermissions.map(p => [p.key, p.name, p.module, p.riskLevel, p.requiresMfa, p.description]);
                exportToExcel({ filename: 'vanguard_permissions_matrix', title: 'Granular Permissions Catalog', orgName: currentOrg.name, headers, rows });
              }}
              onExportDoc={() => {
                const headers = ['Key', 'Name', 'Module', 'Risk Level', 'MFA Requirement'];
                const rows = filteredPermissions.map(p => [p.key, p.name, p.module, p.riskLevel, p.requiresMfa ? 'MFA Required' : 'Standard']);
                exportToDocument({ filename: 'vanguard_permissions_doc', title: 'SOC Access Control Matrix & Authorization Specifications', orgName: currentOrg.name, headers, rows });
              }}
              onExportJSON={() => {
                exportToJSON('vanguard_permissions_matrix', 'Granular System Permissions JSON Export', currentOrg.name, systemPermissions);
              }}
            />
          </div>

          {/* Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="px-4 py-3">Permission Identifier</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">MFA Policy</th>
                  {roles.map(r => (
                    <th key={r.id} className="px-3 py-3 text-center whitespace-nowrap">
                      <span className="font-mono text-[10px] block truncate max-w-[90px]">{r.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPermissions.map(p => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                        <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{p.key}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.description}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          {getModuleIcon(p.module)}
                          <span>{p.module}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase ${getRiskBadge(p.riskLevel)}`}>
                          {p.riskLevel}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.requiresMfa ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-[10px]">
                            <Lock className="w-3 h-3" /> Required
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Standard</span>
                        )}
                      </td>

                      {/* Checkmarks for each role */}
                      {roles.map(r => {
                        const hasPerm = r.permissions.includes(p.key);
                        return (
                          <td key={r.id} className="px-3 py-3 text-center">
                            {hasPerm ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-slate-300 dark:text-slate-700">
                                •
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL / DRAWER: CREATE OR EDIT CUSTOM ROLE */}
      {/* ============================================================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom RBAC Role'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingRole?.isSystem ? 'Fine-tune capability matrix for this system role' : 'Define custom role boundaries and granular permission matrix'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Basic metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    placeholder="e.g. Incident Responder Tier-2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Privilege Scope
                    </label>
                    <select
                      value={roleScope}
                      onChange={e => setRoleScope(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="Global MSP">Global MSP (Multi-Tenant)</option>
                      <option value="Tenant Scoped">Tenant Scoped (Single Org)</option>
                      <option value="Site Specific">Site Specific</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Badge Color
                    </label>
                    <select
                      value={roleColor}
                      onChange={e => setRoleColor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="rose">Rose / Red</option>
                      <option value="amber">Amber / Orange</option>
                      <option value="emerald">Emerald / Green</option>
                      <option value="cyan">Cyan</option>
                      <option value="indigo">Indigo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Operational Intent
                </label>
                <textarea
                  rows={2}
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  placeholder="Describe the functional scope, target personnel, and containment responsibilities of this role..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Presets Toolbar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold"
                  >
                    Full Access (All)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('soc')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold"
                  >
                    SOC Analyst Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('it')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold"
                  >
                    IT Fleet Admin Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('readonly')}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold"
                  >
                    Read-Only Auditor
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="px-2 py-1 text-slate-500 hover:text-red-500 text-[10px] font-bold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedPermissions.length} of {systemPermissions.length} Granted ({Math.round((selectedPermissions.length / systemPermissions.length) * 100)}%)
                </div>
              </div>

              {/* Module-by-Module Permission Matrix Accordion */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Granular Permission Capabilities Matrix
                </label>

                {modulesList.map(moduleName => {
                  const permsInModule = permissionsByModule[moduleName] || [];
                  const isExpanded = expandedModules[moduleName] ?? true;
                  const moduleKeys = permsInModule.map(p => p.key);
                  const selectedInModule = moduleKeys.filter(k => selectedPermissions.includes(k));
                  const allModuleSelected = selectedInModule.length === moduleKeys.length;
                  const someModuleSelected = selectedInModule.length > 0 && !allModuleSelected;

                  return (
                    <div
                      key={moduleName}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                    >
                      {/* Module Accordion Header */}
                      <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }))}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            {getModuleIcon(moduleName)}
                            <span>{moduleName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({selectedInModule.length}/{moduleKeys.length})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleModulePermissions(moduleName)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {allModuleSelected ? 'Deselect All' : 'Select All Module'}
                        </button>
                      </div>

                      {/* Module Permissions List */}
                      {isExpanded && (
                        <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/80">
                          {permsInModule.map(perm => {
                            const isChecked = selectedPermissions.includes(perm.key);

                            return (
                              <label
                                key={perm.id}
                                className="flex items-start gap-3 py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {perm.name}
                                    </span>
                                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                                      {perm.key}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${getRiskBadge(perm.riskLevel)}`}>
                                      {perm.riskLevel}
                                    </span>
                                    {perm.requiresMfa && (
                                      <span className="text-[9px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1 py-0.2 rounded border border-rose-300 dark:border-rose-900 font-bold flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> MFA
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {editingRole ? 'Save Changes to Role' : 'Create Custom Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CLONE ROLE */}
      {/* ============================================================= */}
      {cloningRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-blue-600" />
                Clone Role Template
              </h3>
              <button onClick={() => setCloningRole(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Create a new customizable role with all {cloningRole.permissions.length} permissions pre-configured from <strong className="text-slate-700 dark:text-slate-200">{cloningRole.name}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Role Name *</label>
                <input
                  type="text"
                  required
                  value={cloneName}
                  onChange={e => setCloneName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCloningRole(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCloneRole}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                Clone & Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: DELETE ROLE CONFIRM */}
      {/* ============================================================= */}
      {deletingRoleId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-red-200 dark:border-red-900/80 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm">Delete Custom Role</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this custom RBAC role? This action will be recorded in the cryptographically signed immutable audit trail.
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeletingRoleId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRole}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD / EDIT OPERATOR USER */}
      {/* ============================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingUser ? `Edit Operator: ${editingUser.name}` : 'Provision New SOC Operator'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="jhayes@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">RBAC Role *</label>
                  <select
                    value={userRole}
                    onChange={e => setUserRoleState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>
                        {r.name} {r.isSystem ? '(Built-in)' : '(Custom)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tenant Scope</label>
                  <select
                    value={userOrgId}
                    onChange={e => {
                      const val = e.target.value;
                      setUserOrgId(val);
                      if (val === 'all') {
                        setUserOrg('All Organizations (MSP)');
                      } else {
                        const found = organizations.find(o => o.id === val);
                        if (found) setUserOrg(found.name);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="all">🌐 All Organizations (MSP)</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>🏢 {o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userMfa}
                    onChange={e => setUserMfa(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Enforce Multi-Factor Authentication (MFA / FIDO2)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingUser ? 'Save User' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: DELETE USER CONFIRM */}
      {/* ============================================================= */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-red-200 dark:border-red-900/80 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm">Deactivate User Account</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to deactivate and remove this user account? Their active session tokens and API credentials will be immediately revoked.
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
              >
                Deactivate User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL / DRAWER: INSPECT EFFECTIVE USER PERMISSIONS */}
      {/* ============================================================= */}
      {inspectingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {inspectingUser.avatar || inspectingUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    Effective Permissions for {inspectingUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Active Role: <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{inspectingUser.role}</span> • Perimeter: {inspectingUser.organizationName || 'All Organizations (MSP)'}
                  </p>
                </div>
              </div>
              <button onClick={() => setInspectingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {(() => {
                const userRoleObj = roles.find(r => r.name === inspectingUser.role);
                const grantedKeys = userRoleObj?.permissions || [];
                const grantedPerms = systemPermissions.filter(p => grantedKeys.includes(p.key));

                return (
                  <div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl mb-4 flex items-center justify-between">
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-bold">{grantedPerms.length} Active System Capabilities</span> granted under <span className="font-bold text-blue-600 dark:text-blue-400">{inspectingUser.role}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                        {Math.round((grantedPerms.length / systemPermissions.length) * 100)}% Platform Scope
                      </span>
                    </div>

                    <div className="space-y-4">
                      {modulesList.map(moduleName => {
                        const inModule = grantedPerms.filter(p => p.module === moduleName);
                        if (inModule.length === 0) return null;

                        return (
                          <div key={moduleName} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                              {getModuleIcon(moduleName)}
                              <span>{moduleName} ({inModule.length})</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {inModule.map(p => (
                                <div key={p.id} className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{p.name}</span>
                                    <span className={`text-[8px] font-bold px-1 rounded uppercase ${getRiskBadge(p.riskLevel)}`}>{p.riskLevel}</span>
                                  </div>
                                  <div className="font-mono text-[9px] text-blue-500">{p.key}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
