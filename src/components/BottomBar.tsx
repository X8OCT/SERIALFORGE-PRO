import React, { useEffect, useState } from 'react';
import { AppLanguage } from '../types';
import { I18N } from '../data/i18n';

interface BottomBarProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  statusText: string;
  isRunning: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  lang,
  onToggleLang,
  statusText,
  isRunning,
}) => {
  const t = I18N[lang];
  const [cpuUsage, setCpuUsage] = useState(0.8);
  const [ramUsage, setRamUsage] = useState(38);

  // Dynamic CPU & RAM simulation / telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      if (isRunning) {
        setCpuUsage(Number((2.5 + Math.random() * 4.5).toFixed(1)));
        setRamUsage((prev) => Math.min(95, Math.max(38, prev + Math.floor(Math.random() * 3 - 1))));
      } else {
        setCpuUsage(Number((0.3 + Math.random() * 0.8).toFixed(1)));
        setRamUsage(38);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] px-3 py-1.5 font-mono text-[10px]">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Telemetry Status Message */}
        <div className="text-[#94A3B8] truncate flex-1 min-w-[200px]">
          {statusText}
        </div>

        {/* Right: CPU, RAM & Narrow Cyber Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Creator Badge */}
          <div className="bg-[#111827] border border-[#374151] rounded px-2 py-0.5 flex items-center gap-1 font-bold">
            <span className="text-[#9CA3AF]">{t.ideation}</span>
            <span className="text-[#F3F4F6]">X8OCT</span>
            <span className="text-[#9CA3AF] ml-1">| {t.code}</span>
            <span className="text-[#38BDF8]">Gemini</span>
          </div>

          {/* CPU Badge */}
          <div className="bg-[#0B253A] border border-[#0284C7] rounded px-2 py-0.5 flex items-center gap-1 font-bold">
            <span className="text-[#38BDF8]">⚡ CPU:</span>
            <span className="text-[#E0F2FE]">{cpuUsage.toFixed(1)}%</span>
          </div>

          {/* RAM Badge */}
          <div className="bg-[#2E1065] border border-[#9333EA] rounded px-2 py-0.5 flex items-center gap-1 font-bold">
            <span className="text-[#C084FC]">🧠 RAM:</span>
            <span className="text-[#F3E8FF]">{ramUsage} MB</span>
          </div>

          {/* Cyber Language Switcher Button */}
          <button
            onClick={onToggleLang}
            className="bg-[#111A2E] hover:bg-[#1E293B] text-[#38BDF8] border border-[#0284C7] rounded px-2 py-0.5 font-bold text-[10px] transition-colors"
            title="Сменить язык / Змінити мову / Switch language"
          >
            🌐 {lang.toUpperCase()}
          </button>
        </div>
      </div>
    </footer>
  );
};
