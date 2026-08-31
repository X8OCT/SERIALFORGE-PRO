import React from 'react';
import { X, FolderOpen, ArrowRight } from 'lucide-react';
import { PRESET_PROFILES } from '../data/presets';
import { AppLanguage, PresetProfile } from '../types';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onSelectPreset: (preset: PresetProfile, index: number) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155] bg-[#0A0F1B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {lang === 'ru'
                  ? 'Библиотека готовых протоколов & Пресетов'
                  : lang === 'ua'
                  ? 'Бібліотека готових протоколів & Пресетів'
                  : 'Protocol Presets & Templates'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru'
                  ? 'Быстрая настройка шаблона пакета и диапазона'
                  : lang === 'ua'
                  ? 'Швидке налаштування шаблону пакета та діапазону'
                  : 'Instant configuration for industrial & custom protocols'}
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

        {/* Preset Cards List */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs">
          {PRESET_PROFILES.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => {
                onSelectPreset(p, idx);
                onClose();
              }}
              className="p-3.5 rounded-lg bg-[#0A0F1B] border border-[#334155] hover:border-emerald-500/60 hover:bg-[#151E2E] cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <span>
                      {lang === 'ru' ? p.nameRu : lang === 'ua' ? p.nameUa : p.nameEn}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1E293B] text-sky-300 border border-slate-700">
                      {p.baudRate} baud
                    </span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    {p.isHexMode ? 'HEX BYTES' : 'ASCII/TEXT'} | Template: {p.template}
                  </p>
                </div>
                <button className="px-3 py-1.5 rounded bg-[#1E293B] group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 font-bold transition-all flex items-center gap-1 shrink-0">
                  <span>
                    {lang === 'ru' ? 'Загрузить' : lang === 'ua' ? 'Завантажити' : 'Load'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tag details */}
              <div className="flex flex-wrap gap-2 mt-2.5 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Range: <strong className="text-sky-300">{p.startNum}..{p.endNum}</strong>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Delay: <strong className="text-amber-400">{p.delayMs}ms</strong>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Trigger: <strong className="text-emerald-400">{p.stopPattern}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#334155] bg-[#0A0F1B] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs transition-colors"
          >
            {lang === 'ru' ? 'Отмена' : lang === 'ua' ? 'Скасувати' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
