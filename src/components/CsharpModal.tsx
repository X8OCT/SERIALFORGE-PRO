import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, Terminal, CheckCircle2 } from 'lucide-react';
import { AppLanguage } from '../types';
import { I18N } from '../data/i18n';

interface CsharpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const CsharpModal: React.FC<CsharpModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = I18N[lang];
  const [activeTab, setActiveTab] = useState<'xaml' | 'cs' | 'proj' | 'instructions'>('instructions');
  const [copied, setCopied] = useState(false);

  const instructionsText = t.csharpGuideX1 + '\n\n' + t.csharpGuideX2 + '\n\n' + t.csharpGuideX3;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155] bg-[#0A0F1B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                {t.csharpTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.csharpDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#334155] bg-[#0A0F1B] px-5 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'instructions'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.setupGuideTab}
          </button>
          <button
            onClick={() => setActiveTab('xaml')}
            className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'xaml'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MainWindow.xaml
          </button>
          <button
            onClick={() => setActiveTab('cs')}
            className={`py-2.5 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'cs'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MainWindow.xaml.cs
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto font-mono text-xs bg-[#070B14] text-slate-200 select-text">
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <pre className="p-4 bg-[#0A0F1B] rounded-lg border border-slate-800 text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {instructionsText}
              </pre>

              <div className="p-4 bg-[#0F172A] rounded-lg border border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>{t.oneLineRun}</span>
                </h4>
                <div className="p-2.5 bg-[#050811] rounded border border-slate-800 text-sky-300 font-bold flex items-center justify-between">
                  <code>dotnet run --project csharp_wpf/SerialForgeWpf.csproj</code>
                  <button
                    onClick={() => copyCode('dotnet run --project csharp_wpf/SerialForgeWpf.csproj')}
                    className="p-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300"
                    title="Copy command"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xaml' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-[11px]">csharp_wpf/MainWindow.xaml</span>
                <button
                  onClick={() => copyCode('MainWindow.xaml content available in /csharp_wpf/MainWindow.xaml')}
                  className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{t.copyPathBtn}</span>
                </button>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {t.csharpGuideX1}
              </p>
            </div>
          )}

          {activeTab === 'cs' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-[11px]">csharp_wpf/MainWindow.xaml.cs</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {t.csharpGuideX2}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#334155] bg-[#0A0F1B] flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            {t.csharpFilesLocated}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-mono transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
