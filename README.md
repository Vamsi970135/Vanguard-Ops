# Vanguard Ops — Autonomous Unified RMM, Vulnerability & SOC Platform

> **Brand Caption:** Next-Generation Autonomous Endpoint Security, Patch Management & Unified SOC Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Enterprise%20SOC-emerald.svg)]()

---

## 🛡️ Overview

**Vanguard Ops** is an enterprise-grade, multi-tenant cybersecurity operations and Remote Monitoring & Management (RMM) platform. It unifies endpoint detection and response (EDR), automated patch orchestration, continuous CVE vulnerability management, real-time SOC alert triage, threat hunting with MITRE ATT&CK mapping, and compliance governance into a single, high-performance interface.

---

## ✨ Core Capabilities

### 🏢 1. Tenant Management & Strict Isolation
- **Per-Tenant Data Boundaries:** Select any single tenant organization to automatically filter all endpoints, vulnerabilities, patch policies, alerts, incidents, and audit logs. No cross-tenant data leakage.
- **Dynamic Provisioning:** Add new tenant organizations with custom SLAs, retention periods, risk thresholds, and cloud regions.
- **De-provisioning & Purging:** Safe tenant deletion with cascade removal of associated telemetry and assets.

### 💻 2. Multi-Platform Agent Installation
- **Operating Systems Supported:**
  - **Windows (x64 / ARM64):** One-liner PowerShell and Silent MSI installer package (`msiexec /i VanguardAgent.msi /qn ENROLLMENT_TOKEN=...`).
  - **Linux (Ubuntu, Debian, RHEL, CentOS, Rocky Linux):** `curl -sSL https://get.vanguardops.io/linux/install.sh | sudo bash -s -- --token ...` with systemd unit installation.
  - **macOS (Apple Silicon & Intel):** PKG package installer and silent terminal command with LaunchDaemon registration.
- **Interactive Agent Token Generator:** Generates tenant-scoped enrollment tokens with auto-fill configuration strings.
- **Live Agent Simulator:** Test immediate agent check-ins and fleet registration directly within the UI.

### 📜 3. 'Action History' Audit Log Component
- **Security Rules & System Settings Tracking:** Dedicated audit stream tracking changes to detection rules, Sigma rules, custom behavioral heuristics, brand captions, MFA enforcement, tenant perimeters, and patch windows.
- **Visual Diff Inspector:** Inspect previous vs. new configuration states with side-by-side snapshot comparison.
- **Cryptographic Tamper-Proof Trail:** Every action is stamped with a SHA-256 digest signature for SOC 2 Type II, ISO 27001, and NIST CSF 2.0 compliance.
- **One-Click State Rollback:** Revert accidental or malicious configuration changes back to prior states with automatic rollback audit logging.
- **Manual Change Recording:** SOC administrators can record out-of-band maintenance events and rule updates.

### 🔐 4. Dynamic Role-Based Access Control (RBAC) & Custom Roles
- **Custom Role Engine:** Create, edit, clone, and manage custom enterprise authorization roles tailored to organizational hierarchy.
- **38 Granular Permission Capabilities:** Fine-grained access matrix spanning 9 functional modules (Fleet & Endpoints, Vulnerabilities & CVEs, Patch Management, SOC & Incident Response, Detection Rules, Threat Hunting, Automated Reports, Tenant Management, and System Governance).
- **Risk Level & MFA Enforcement Flags:** Clear indicators for Low, Medium, High, and Critical permissions with mandatory FIDO2/MFA requirements for sensitive operations (e.g., host network isolation, rule enforcement, memory dumps, audit rollback).
- **Live User Directory & Instant Role Assignment:** Provision new SOC operators, assign tenant perimeters, enforce MFA, and inspect effective permission breakdowns.
- **Quick-Start Presets:** One-click presets for *Full Access*, *SOC Operator*, *IT Fleet Admin*, and *Read-Only Auditor*.
- **Role Cloning:** Duplicate existing built-in or custom roles in a single click to rapidly create tiered sub-roles.
- **Compliance Export:** Export RBAC role schemas and granular permission matrices to PDF, Word, Excel, CSV, and JSON.

### 📊 5. Automated Multi-Format Report Generation
- **Supported Formats:**
  - 📕 **PDF** (Executive-ready tables, metadata headers, and signatures)
  - 📘 **Word Document (.doc / HTML document)**
  - 📗 **Excel Spreadsheet (.xlsx / CSV)**
  - 📙 **CSV** (Comma-Separated Values for data warehouses)
  - 📄 **JSON** (Machine-readable full raw telemetry dataset)
- **Scheduled Dispatch:** Configure Daily, Weekly, Bi-Weekly, or Monthly report schedules with automated multi-format outputs and recipient management.
- **Instant "Run Now" Dispatch:** Immediate ad-hoc compilation and compliance export.

### 🎯 5. Unified SOC & RMM Modules
- **Autonomous Fleet Monitoring:** Real-time CPU, RAM, disk, agent heartbeat, and isolation controls.
- **CVE Vulnerability Remediation:** Automated CVSS scoring, exploit intelligence, and patch push.
- **SOC Alert Triage & Incident War Room:** Real-time correlation, MITRE ATT&CK tactical matrix, and playbooks.
- **Threat Hunting:** KQL-style query engine for endpoint forensic sweeps.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/vanguard-ops.git
cd vanguard-ops
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ActionHistoryAuditLog.tsx    # Dedicated Security Rules & System Settings Audit Log
│   │   │   ├── AdminManagement.tsx          # Multi-Tenant & Platform Administration
│   │   │   ├── AgentInstallModal.tsx        # Multi-OS (Win/Linux/Mac) Agent Installation Wizard
│   │   │   └── RBACManagement.tsx           # Custom Roles, Permissions Matrix & User Directory
│   │   ├── common/
│   │   │   └── ExportDropdown.tsx           # Multi-Format (PDF/DOC/Excel/CSV/JSON) Exporter
│   │   ├── dashboard/
│   │   │   └── ExecutiveDashboard.tsx       # Main SOC & Fleet Overview
│   │   ├── endpoints/
│   │   │   └── EndpointsView.tsx            # Fleet RMM & Isolation Controls
│   │   ├── navigation/
│   │   │   ├── TopNav.tsx                   # Tenant Selector & Brand Caption Header
│   │   │   └── SideNav.tsx                  # Module Navigation Sidebar
│   │   ├── patches/
│   │   │   └── PatchesView.tsx              # Zero-Day & OS Patch Orchestrator
│   │   ├── reports/
│   │   │   └── ReportsView.tsx              # Automated Report Scheduler & Exporter
│   │   ├── rules/
│   │   │   └── RulesEngine.tsx              # Custom Security Detection Rules
│   │   ├── soc/
│   │   │   ├── SOCView.tsx                  # Incident Response & SOC War Room
│   │   │   ├── ThreatHuntingView.tsx        # Deep Forensic Sweeps
│   │   │   └── MitreMatrixView.tsx          # MITRE ATT&CK Matrix Navigator
│   │   └── vulnerabilities/
│   │       └── VulnerabilitiesView.tsx      # CVE Scanner & Risk Prioritizer
│   ├── context/
│   │   └── AppContext.tsx                   # Global State & Strict Tenant Data Isolation Engine
│   ├── data/
│   │   └── mockData.ts                      # Enterprise Mock Telemetry & Audit Logs
│   ├── types/
│   │   └── index.ts                         # Complete TypeScript Definitions
│   ├── utils/
│   │   └── exportUtils.ts                   # Export Engine for PDF, Excel, Word, CSV, JSON
│   ├── App.tsx                              # Main Application Layout
│   └── main.tsx                             # Application Entry Point
├── index.html                               # HTML Entry & Meta Tags
├── package.json                             # Dependencies & Scripts
├── tailwind.config.js                       # Tailwind CSS Styling Config
├── tsconfig.json                            # TypeScript Compiler Configuration
└── vite.config.ts                           # Vite Build Engine Configuration
```

---

## 👥 Role-Based Access Control (RBAC)

Switch roles on the fly using the user avatar menu in the top-right corner:

| Role | Permissions |
| :--- | :--- |
| **Super Admin** | Full global visibility, tenant creation/deletion, policy modification, system settings & audit rollback. |
| **SOC Admin** | Security rule authoring, alert triage, incident escalation, endpoint network isolation. |
| **Security Analyst** | CVE analysis, patch deployment, threat hunting queries, report generation. |
| **IT Admin** | Endpoint agent deployment, site maintenance, routine patch approvals. |
| **Auditor** | Read-only compliance inspection, cryptographic audit log verification, report exports. |

---

## 📄 License & Compliance

Licensed under the **Enterprise SOC Commercial License**. Built for compliance with **SOC 2 Type II**, **NIST CSF 2.0**, **ISO/IEC 27001**, and **HIPAA Security Rule**.
