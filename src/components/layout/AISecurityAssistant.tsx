import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Send, Bot, User as UserIcon, X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: { label: string; action: () => void }[];
}

export const AISecurityAssistant: React.FC = () => {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    endpoints,
    vulnerabilities,
    alerts,
    isolateEndpoint,
    setActiveNav
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello Analyst. I am your **Vanguard AI SOC & Threat Copilot**. I have real-time visibility into your fleet of ${endpoints.length} endpoints, ${vulnerabilities.length} active CVEs, and ${alerts.length} SOC alerts.\n\nHow can I assist your investigation today?`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isAiAssistantOpen) return null;

  const quickPrompts = [
    'Explain CVE-2024-38077 risk and exploitability',
    'Summarize active alerts on NYC-PROD-SQL01',
    'Show internet-facing assets with missing critical patches',
    'Draft an Incident Response playbook for Cobalt Strike beacon'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      let replyActions: { label: string; action: () => void }[] | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('38077') || lower.includes('madlicense')) {
        replyText = `**Vulnerability Deep Dive: CVE-2024-38077 (Windows Remote Desktop Licensing RCE)**\n\n- **CVSS Score:** 9.8 (Critical) | **EPSS:** 94.2% | **CISA KEV:** Confirmed Active Exploitation\n- **Impact:** Allows an unauthenticated attacker to send crafted packets to the Remote Desktop Licensing service (port 3389/RPC) and achieve full \`SYSTEM\` execution.\n- **Affected in Fleet:** 4 servers identified (\`NYC-PROD-SQL01\` is currently showing suspicious reverse-shell activity).\n- **Recommended Containment:**\n  1. Immediately isolate affected hosts from untrusted ingress.\n  2. Deploy Microsoft Update **KB5039211**.\n  3. If patch cannot be applied immediately, stop and disable the \`TermServLicensing\` service.`;
        replyActions = [
          {
            label: 'Isolate Host NYC-PROD-SQL01',
            action: () => {
              isolateEndpoint('ep-001');
              setActiveNav('endpoints');
              setIsAiAssistantOpen(false);
            }
          },
          {
            label: 'View Patch KB5039211',
            action: () => {
              setActiveNav('patches');
              setIsAiAssistantOpen(false);
            }
          }
        ];
      } else if (lower.includes('nyc-prod-sql01') || lower.includes('alert')) {
        replyText = `**SOC Alert Assessment for NYC-PROD-SQL01 (10.240.12.15)**\n\n- **Current Severity:** Critical (Risk Score: 88/100)\n- **Active Threat:** IIS process (\`w3wp.exe\`) spawned encoded PowerShell (\`PID 5120\`) communicating with Russian bulletproof IP \`185.220.101.5:4444\`.\n- **MITRE ATT&CK:** T1059.001 (PowerShell), T1190 (Exploit Public App), T1071 (Web Protocols C2).\n- **Status:** Escalated to Incident INC-2026-0042. Analyst John Doe has commenced memory analysis.`;
        replyActions = [
          {
            label: 'Go to Incident Response',
            action: () => {
              setActiveNav('incidents');
              setIsAiAssistantOpen(false);
            }
          }
        ];
      } else if (lower.includes('internet') || lower.includes('facing')) {
        replyText = `**Filter Query Executed: Internet-Facing Assets with Critical Missing Patches**\n\nFound **2 High-Priority Endpoints** matching criteria:\n\n1. **NYC-PROD-SQL01** (10.240.12.15 / Public: 198.51.100.24) — Missing KB5039211 (8 Critical Patches, Risk: 88)\n2. **SGP-DMZ-WEB02** (172.16.40.102 / Public: 203.0.113.88) — Missing 6 Critical Linux Kernel & OpenSSL Patches (Risk: 84)\n\nBoth servers are internet-exposed and require immediate patching or containment.`;
        replyActions = [
          {
            label: 'Filter Endpoints View',
            action: () => {
              setActiveNav('endpoints');
              setIsAiAssistantOpen(false);
            }
          }
        ];
      } else {
        replyText = `**Analysis Complete**\n\nBased on Vanguard telemetry for organization **Global Enterprise Ltd**:\n- Fleet Health: 98.2% Online (1,248 endpoints)\n- Critical Zero-Days: 8 detected (CVE-2024-38077 and CVE-2024-3094 prioritized)\n- Active Containment: 1 host in network quarantine.\n\nWould you like me to generate a tailored remediation script or compliance briefing?`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
        actions: replyActions
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/50">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
              Vanguard AI SOC Copilot
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Context-Aware Fleet & Threat Intelligence
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAiAssistantOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended 1-Click Operations
                  </div>
                  {msg.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={act.action}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-[11px] font-bold transition-all text-left"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 items-center text-slate-400 text-xs italic">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex gap-1 items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
          Suggested Security Inquiries
        </div>
        <div className="flex flex-wrap gap-1">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors truncate max-w-full text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input
          id="ai-assistant-input"
          type="text"
          placeholder="Ask AI Copilot to correlate alerts, analyze CVEs, or isolate hosts..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
        <button
          id="ai-assistant-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
