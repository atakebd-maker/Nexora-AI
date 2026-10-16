import React, { useState } from 'react';
import { Settings, ShieldCheck, Server, HardDrive, Cpu, CheckCircle2, AlertTriangle, FileCode, ExternalLink } from 'lucide-react';
import { ServerStatus } from '../types.ts';
import { AdBanner } from '../components/AdBanner.tsx';

interface SettingsViewProps {
  serverStatus: ServerStatus | null;
  totalConversations: number;
  totalMessages: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  serverStatus,
  totalConversations,
  totalMessages,
}) => {
  const [autoSave, setAutoSave] = useState(true);
  const [temperature, setTemperature] = useState(0.7);

  const isConfigured = serverStatus?.configured ?? false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage local platform preferences, examine server health, and review source configuration details.
        </p>
      </div>

      {/* Central Server-Side Key Configuration Notice (Strictly Source-Code Based) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇧🇩</span>
              <h3 className="text-base font-bold text-slate-900">
                Central Server-Side API Configuration
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              In accordance with security standards and project architecture, API credentials are never configured via browser forms. Instead, all 16 AI tools share a single server-side configuration file in your source code.
            </p>
          </div>

          <div className="flex-shrink-0">
            {isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Key Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Setup Needed
              </span>
            )}
          </div>
        </div>

        {/* Source File Instruction Box */}
        <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
          <div className="text-slate-400 text-[11px] flex items-center justify-between pb-2 border-b border-slate-800">
            <span>File to edit: <strong className="text-blue-400">server/config.ts (Line 11)</strong> or <strong className="text-blue-400">.env</strong></span>
            <span className="text-emerald-400">Single Central Location</span>
          </div>
          <div className="pt-1 text-slate-400 leading-relaxed">
            <span className="text-amber-300">// ==============================================================================</span><br />
            <span className="text-amber-300">// 🇧🇩 PASTE YOUR GOOGLE GEMINI API KEY HERE — THIS IS THE ONLY PLACE TO ADD IT. DO NOT CHANGE OTHER CODE.</span><br />
            <span className="text-amber-300">// ==============================================================================</span><br />
            <span className="text-blue-400">export const</span> <span className="text-emerald-300">MANUAL_GEMINI_API_KEY</span> = <span className="text-amber-200">"YOUR_GEMINI_API_KEY_HERE"</span>;
          </div>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            <strong>How to get your free key:</strong> Visit{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5"
            >
              Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
            , copy your key, and paste it into line 11 of <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">server/config.ts</code>.
          </p>
        </div>
      </div>

      {/* Model & AI Engine Specs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Active Intelligence Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">
              Primary Language & Vision Engine
            </span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">
              Google Gemini 3.8 Flash
            </span>
            <span className="text-slate-500 text-[11px] mt-1 block">
              Powers conversational chat, writing assistant, OCR, math solver, and coding assistant.
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">
              Generative Visual Engine
            </span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">
              Gemini 3.1 Flash Lite Image
            </span>
            <span className="text-slate-500 text-[11px] mt-1 block">
              Powers direct text-to-image synthesis and image transformation tools.
            </span>
          </div>
        </div>

        {/* Temperature / Creativity Slider */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Creativity & Response Diversity</span>
            <span className="font-mono text-blue-600 font-bold">{temperature}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0.1 (Precise & Factual)</span>
            <span>0.7 (Balanced Default)</span>
            <span>1.0 (Highly Creative)</span>
          </div>
        </div>
      </div>

      {/* Storage & Privacy Management */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span>Local Storage & Data Privacy</span>
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div>
            <span className="font-semibold text-slate-800 block">Auto-Save Conversations</span>
            <span className="text-slate-400 text-[11px]">
              Automatically save conversation messages to your browser's local store
            </span>
          </div>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">Saved Conversations</span>
            <span className="text-lg font-bold text-slate-800">{totalConversations}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">Total Archived Messages</span>
            <span className="text-lg font-bold text-slate-800">{totalMessages}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Zero Public Exposure:</strong> Client requests communicate only with your application's private server backend. No API keys or authorization headers ever travel to visitor browsers.
          </span>
        </div>
      </div>

      <AdBanner placement="inline" />
    </div>
  );
};
