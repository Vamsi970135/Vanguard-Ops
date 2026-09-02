import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Organization } from '../../types';
import {
  Settings,
  Building2,
  Users,
  Shield,
  FileCode,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Sparkles,
  AlertTriangle,
  Globe,
  Mail,
  Server,
  Layers,
  Palette,
  Check,
  X,
  Sliders,
  ShieldCheck,
  KeyRound,
  History
} from 'lucide-react';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportToCSV, exportToPDF, exportToExcel, exportToDocument, exportToJSON } from '../../utils/exportUtils';
import { ActionHistoryAuditLog } from './ActionHistoryAuditLog';
import { RBACManagement } from './RBACManagement';

export const AdminManagement: React.FC = () => {
  const {
    organizations,
    currentOrg,
    selectedOrgId,
    switchOrg,
    addOrganization,
    deleteOrganization,
    updateOrganization,
    auditLogs,
    recordAuditLog,
    currentUser,
    setUserRole,
    roles,
    systemUsers,
    addToast,
    setActiveNav
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tenants' | 'branding' | 'users' | 'audit'>('tenants');
  const [searchTenantQuery, setSearchTenantQuery] = useState('');
  
  // Modals
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);

  // New Tenant Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [newOrgContactName, setNewOrgContactName] = useState('');
  const [newOrgContactEmail, setNewOrgContactEmail] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<'Enterprise Elite' | 'MSSP Partner Multi-Tenant' | 'Professional Growth' | 'Standard'>('Enterprise Elite');
  const [newOrgInitialSites, setNewOrgInitialSites] = useState('HQ - Primary Data Center, Branch Office');

  // Brand Customization State
  const [brandTitle, setBrandTitle] = useState('Vanguard Ops');
  const [brandCaption, setBrandCaption] = useState('Autonomous Unified RMM, Vulnerability & SOC Platform');
  const [brandCompany, setBrandCompany] = useState('Vanguard Security Intelligence Inc.');
  const [supportEmail, setSupportEmail] = useState('soc-support@vanguardops.io');
  const [brandTagline, setBrandTagline] = useState('Next-Generation Autonomous Endpoint & Threat Defense');
  const [isSavedBrand, setIsSavedBrand] = useState(false);

  // Users Mock Data
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'John Doe', email: 'jdoe@vanguardops.io', role: 'Super Admin', mfa: true, lastLogin: '10 mins ago', org: 'All Organizations (MSP)' },
    { id: 'u2', name: 'Sarah Lin', email: 'slin@acmecorp.com', role: 'SOC Admin', mfa: true, lastLogin: '1 hour ago', org: 'Acme Global Corp' },
    { id: 'u3', name: 'Michael Chen', email: 'mchen@apexfin.com', role: 'Security Analyst', mfa: true, lastLogin: '3 hours ago', org: 'Apex Financial Holdings' },
    { id: 'u4', name: 'Elena Rostova', email: 'erostova@novahealth.org', role: 'IT Admin', mfa: true, lastLogin: 'Yesterday', org: 'Nova Health Systems' },
    { id: 'u5', name: 'David Kim', email: 'dkim@vanguardops.io', role: 'Auditor', mfa: true, lastLogin: '3 days ago', org: 'All Organizations (MSP)' }
  ]);

  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Super Admin' | 'SOC Admin' | 'Security Analyst' | 'IT Admin' | 'Auditor'>('Security Analyst');
  const [newUserOrg, setNewUserOrg] = useState(organizations[0]?.name || 'Acme Global Corp');

  const filteredOrgs = organizations.filter(o => {
    if (!searchTenantQuery.trim()) return true;
    const q = searchTenantQuery.toLowerCase();
    return o.name.toLowerCase().includes(q) || (o.domain && o.domain.toLowerCase().includes(q)) || o.id.toLowerCase().includes(q);
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      addToast('Validation Error', 'Tenant name is required', 'error');
      return;
    }

    const sitesList = newOrgInitialSites.split(',').map(s => s.trim()).filter(Boolean);

    const created = addOrganization({
      name: newOrgName.trim(),
      domain: newOrgDomain.trim() || `${newOrgName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      primaryContactName: newOrgContactName.trim() || 'IT Security Team',
      primaryContactEmail: newOrgContactEmail.trim() || `admin@${newOrgDomain.trim() || 'company.com'}`,
      plan: newOrgPlan,
      sites: sitesList.length > 0 ? sitesList : ['Headquarters - Primary Site']
    });

    setIsAddTenantModalOpen(false);
    setNewOrgName('');
    setNewOrgDomain('');
    setNewOrgContactName('');
    setNewOrgContactEmail('');
    setNewOrgInitialSites('HQ - Primary Data Center, Branch Office');

    addToast('Tenant Organization Provisioned', `Created "${created.name}" with isolated tenant database schema.`, 'success');
  };

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    updateOrganization(editingOrg.id, {
      name: editingOrg.name,
      domain: editingOrg.domain,
      primaryContactName: editingOrg.primaryContactName,
      primaryContactEmail: editingOrg.primaryContactEmail,
      plan: editingOrg.plan
    });

    addToast('Tenant Updated', `Changes to "${editingOrg.name}" saved successfully.`, 'success');
    setEditingOrg(null);
  };

  const handleDeleteTenantConfirm = () => {
    if (!deletingOrg) return;
    if (organizations.length <= 1) {
      addToast('Action Prohibited', 'Cannot delete the only remaining tenant organization in the platform.', 'error');
      setDeletingOrg(null);
      return;
    }

    const orgNameToDelete = deletingOrg.name;
    deleteOrganization(deletingOrg.id);
    setDeletingOrg(null);
    addToast('Tenant Deleted', `Organization "${orgNameToDelete}" and isolated workspaces removed.`, 'warning');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedBrand(true);
    recordAuditLog({
      category: 'System Setting',
      action: 'Brand Caption & Platform Whitelabel Updated',
      object: `Brand: ${brandTitle} | Caption: "${brandCaption}"`,
      previousValue: 'Default Vanguard Brand Metadata',
      newValue: `Title: ${brandTitle}, Caption: "${brandCaption}", Company: ${brandCompany}, Email: ${supportEmail}`,
      diffSummary: `~ Brand Caption: "${brandCaption}"\n~ Support Contact: ${supportEmail}`,
      result: 'Success',
      severity: 'Info'
    });
    addToast('Brand Settings Saved', `Platform caption updated to "${brandCaption}".`, 'success');
    setTimeout(() => setIsSavedBrand(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      addToast('Validation Error', 'Name and email are required', 'error');
      return;
    }

    const newUser = {
      id: `u-${Date.now().toString(36)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      mfa: true,
      lastLogin: 'Never',
      org: newUserOrg
    };

    setUsersList(prev => [newUser, ...prev]);
    setNewUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    addToast('User Provisioned', `Added ${newUser.name} with ${newUser.role} credentials.`, 'success');
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Administration, Multi-Tenancy & Governance
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-tenant organizations, isolated data perimeters, branding captions, and RBAC security credentials
          </p>
        </div>

        {activeTab === 'tenants' && (
          <button
            id="add-new-tenant-btn"
            onClick={() => setIsAddTenantModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tenant Organization</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 gap-6">
        <button
          id="tab-tenants-mgmt"
          onClick={() => setActiveTab('tenants')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tenant Management ({organizations.length})</span>
        </button>

        <button
          id="tab-branding-mgmt"
          onClick={() => setActiveTab('branding')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Brand Caption & Platform Whitelabel</span>
        </button>

        <button
          id="tab-users-mgmt"
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBAC & User Access ({roles.length} Roles, {systemUsers.length} Users)</span>
        </button>

        <button
          id="tab-audit-mgmt"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Action History & Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB: TENANTS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tenants' && (
        <div className="space-y-5">
          {/* Active Tenant Context Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent border border-blue-200 dark:border-blue-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Current Working Perimeter</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Active Isolation
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {currentOrg.name} <span className="text-xs text-slate-400 font-mono font-normal">({currentOrg.id})</span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Quick Scope:</span>
              <select
                value={selectedOrgId}
                onChange={e => switchOrg(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs shadow-2xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🌐 All Organizations (MSP Global View)</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>
                    🏢 {o.name} ({o.endpointCount} nodes)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search organizations by name, domain, or ID..."
                value={searchTenantQuery}
                onChange={e => setSearchTenantQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200/80 dark:border-slate-800/80 shadow-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredOrgs.length} of {organizations.length} Tenants
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrgs.map(org => {
              const isSelected = selectedOrgId === org.id;

              return (
                <div
                  key={org.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs space-y-4 transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Top bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shadow-2xs font-bold text-sm">
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{org.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Active Tenant" />
                          )}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {org.id}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                      {org.plan}
                    </span>
                  </div>

                  {/* Metadata items */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Domain:
                      </span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{org.domain || 'internal.local'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Contact:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{org.primaryContactEmail || 'admin@domain.com'}</span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Managed Nodes</span>
                      <div className="font-black mt-0.5 text-slate-800 dark:text-slate-200 font-mono text-sm">{org.endpointCount} Endpoints</div>
                    </div>
                    <div className="p-2.5 bg-orange-50/50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/50">
                      <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Risk Rating</span>
                      <div className="font-black text-orange-600 dark:text-orange-400 mt-0.5 font-mono text-sm">{org.riskScore} / 100</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                    <button
                      id={`switch-tenant-btn-${org.id}`}
                      onClick={() => {
                        switchOrg(org.id);
                        setActiveNav('endpoints');
                        addToast('Switched Tenant Scope', `Active workspace switched to "${org.name}".`, 'info');
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{isSelected ? 'Active Scope' : 'Select Tenant'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      id={`edit-tenant-btn-${org.id}`}
                      onClick={() => setEditingOrg(org)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Edit Tenant Configuration"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      id={`delete-tenant-btn-${org.id}`}
                      onClick={() => setDeletingOrg(org)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Tenant Organization"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: BRAND CAPTION & PLATFORM WHITELABEL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'branding' && (
        <div className="max-w-3xl space-y-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" />
              Platform Branding, Caption & Identity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customize the platform name, brand caption, executive report watermarks, and tenant login subtitle.
            </p>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Platform Name
                </label>
                <input
                  type="text"
                  value={brandTitle}
                  onChange={e => setBrandTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="e.g. Vanguard Ops"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Appears in navbar, headers, and tabs</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Caption / Tagline (Slogan)
                </label>
                <input
                  type="text"
                  value={brandCaption}
                  onChange={e => setBrandCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Autonomous Unified RMM, Vulnerability & SOC Platform"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Official subtitle used in report headers and tenant banner</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Entity / Company Name
                </label>
                <input
                  type="text"
                  value={brandCompany}
                  onChange={e => setBrandCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Vanguard Security Intelligence Inc."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  SOC Support Contact Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. soc-support@vanguardops.io"
                />
              </div>
            </div>

            {/* Live Brand Preview Card */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Live Brand Preview
              </label>
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black">
                    V
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight">{brandTitle}</div>
                    <div className="text-[11px] text-slate-400">{brandCaption}</div>
                  </div>
                </div>
                <div className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.5 rounded font-mono">
                  {brandCompany}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              {isSavedBrand && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Brand Caption Saved!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Save Brand Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: USERS & RBAC GOVERNANCE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <RBACManagement />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: ACTION HISTORY & AUDIT LOG */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <ActionHistoryAuditLog />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD TENANT ORGANIZATION */}
      {/* ------------------------------------------------------------- */}
      {isAddTenantModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    Provision New Tenant Organization
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Creates an isolated multi-tenant data perimeter and telemetry database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTenantModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  placeholder="e.g. Zenith Aerospace Ltd."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Domain
                  </label>
                  <input
                    type="text"
                    value={newOrgDomain}
                    onChange={e => setNewOrgDomain(e.target.value)}
                    placeholder="zenith-aero.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={newOrgPlan}
                    onChange={e => setNewOrgPlan(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="Enterprise Elite">Enterprise Elite (24/7 SOC)</option>
                    <option value="MSSP Partner Multi-Tenant">MSSP Partner Multi-Tenant</option>
                    <option value="Professional Growth">Professional Growth</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    value={newOrgContactName}
                    onChange={e => setNewOrgContactName(e.target.value)}
                    placeholder="Jane Doe (IT Director)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    type="email"
                    value={newOrgContactEmail}
                    onChange={e => setNewOrgContactEmail(e.target.value)}
                    placeholder="jdoe@zenith-aero.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Site Locations (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newOrgInitialSites}
                  onChange={e => setNewOrgInitialSites(e.target.value)}
                  placeholder="Primary Data Center, Austin HQ, London Office"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT TENANT */}
      {/* ------------------------------------------------------------- */}
      {editingOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Tenant: {editingOrg.name}
              </h3>
              <button
                onClick={() => setEditingOrg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tenant Name
                </label>
                <input
                  type="text"
                  required
                  value={editingOrg.name}
                  onChange={e => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  value={editingOrg.domain || ''}
                  onChange={e => setEditingOrg({ ...editingOrg, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Contact Email
                </label>
                <input
                  type="email"
                  value={editingOrg.primaryContactEmail || ''}
                  onChange={e => setEditingOrg({ ...editingOrg, primaryContactEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Plan Tier
                </label>
                <select
                  value={editingOrg.plan}
                  onChange={e => setEditingOrg({ ...editingOrg, plan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="Enterprise Elite">Enterprise Elite</option>
                  <option value="MSSP Partner Multi-Tenant">MSSP Partner Multi-Tenant</option>
                  <option value="Professional Growth">Professional Growth</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE TENANT CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {deletingOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-rose-200 dark:border-rose-900 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  Delete Tenant Organization?
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  This action is irreversible.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{deletingOrg.name}"</strong> (ID: <code className="font-mono text-[11px]">{deletingOrg.id}</code>)? All {deletingOrg.endpointCount} associated managed endpoints, alerts, and report schedules in this tenant perimeter will be removed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingOrg(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-tenant-btn"
                onClick={handleDeleteTenantConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Permanently Delete Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD USER */}
      {/* ------------------------------------------------------------- */}
      {newUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Add SOC Operator / User
              </h3>
              <button onClick={() => setNewUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="jhayes@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">RBAC Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="SOC Admin">SOC Admin</option>
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="IT Admin">IT Admin</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Tenant</label>
                  <select
                    value={newUserOrg}
                    onChange={e => setNewUserOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="All Organizations (MSP)">All Organizations (MSP)</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
