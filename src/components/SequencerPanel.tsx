import React, { useRef } from 'react';
import { AppLanguage, MatchMode, PayloadMode } from '../types';
import { I18N } from '../data/i18n';
import { buildDynamicPacket } from '../utils/packetBuilder';

interface SequencerPanelProps {
  lang: AppLanguage;
  payloadMode: PayloadMode;
  onChangePayloadMode: (mode: PayloadMode) => void;
  templateText: string;
  onChangeTemplateText: (tmpl: string) => void;
  startNum: number;
  onChangeStartNum: (num: number) => void;
  endNum: number;
  onChangeEndNum: (num: number) => void;
  step: number;
  onChangeStep: (step: number) => void;
  delayMs: number;
  onChangeDelayMs: (delay: number) => void;
  stopOnMatch: boolean;
  onChangeStopOnMatch: (stop: boolean) => void;
  matchMode: MatchMode;
  onChangeMatchMode: (mode: MatchMode) => void;
  stopPattern: string;
  onChangeStopPattern: (pat: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  currentSeqNumber: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSingleProbe: () => void;
  isConnected: boolean;
}

export const SequencerPanel: React.FC<SequencerPanelProps> = ({
  lang,
  payloadMode,
  onChangePayloadMode,
  templateText,
  onChangeTemplateText,
  startNum,
  onChangeStartNum,
  endNum,
  onChangeEndNum,
  step,
  onChangeStep,
  delayMs,
  onChangeDelayMs,
  stopOnMatch,
  onChangeStopOnMatch,
  matchMode,
  onChangeMatchMode,
  stopPattern,
  onChangeStopPattern,
  isRunning,
  isPaused,
  currentSeqNumber,
  onStart,
  onPause,
  onResume,
  onStop,
  onSingleProbe,
  isConnected,
}) => {
  const t = I18N[lang];
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute live preview based on start number or current running number
  const previewNum = isRunning ? currentSeqNumber : startNum;
  const previewPacket = buildDynamicPacket(templateText, previewNum, payloadMode);

  // Calculate progress
  const totalRange = Math.max(1, endNum - startNum);
  const doneSoFar = Math.max(0, currentSeqNumber - startNum);
  const progressPercent = Math.min(100, Math.max(0, (doneSoFar / totalRange) * 100));

  const insertMacro = (macro: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? templateText.length;
      const end = input.selectionEnd ?? templateText.length;
      const next = templateText.substring(0, start) + macro + templateText.substring(end);
      onChangeTemplateText(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + macro.length, start + macro.length);
      }, 0);
    } else {
      onChangeTemplateText(templateText + macro);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-md p-3 font-mono flex flex-col h-full overflow-y-auto">
      <div className="flex-1 space-y-3">
        {/* ================= 1. PAYLOAD & TEMPLATE ================= */}
      <div className="bg-[#111A2E] border border-[#1E293B] rounded p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-[#38BDF8]">
            {t.sec1Header}
          </span>
          <div className="flex items-center gap-3 text-[10px] text-slate-300">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="payload_mode"
                checked={payloadMode === 'text'}
                onChange={() => {
                  if (templateText.includes('generatePacket')) {
                    onChangeTemplateText('PIN:{DEC:4}\\r\\n');
                  }
                  onChangePayloadMode('text');
                }}
                className="accent-sky-500"
              />
              <span>{t.textMode}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="payload_mode"
                checked={payloadMode === 'hex'}
                onChange={() => {
                  if (templateText.includes('generatePacket')) {
                    onChangeTemplateText('AA 55 {HEX:2} 00 FF');
                  }
                  onChangePayloadMode('hex');
                }}
                className="accent-sky-500"
              />
              <span>{t.hexMode}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-emerald-400">
              <input
                type="radio"
                name="payload_mode"
                checked={payloadMode === 'script'}
                onChange={() => {
                  if (!templateText.includes('generatePacket')) {
                    onChangeTemplateText('function generatePacket(num) {\n  return "PIN:" + num + "\\\\r\\\\n";\n}');
                  }
                  onChangePayloadMode('script');
                }}
                className="accent-emerald-500"
              />
              <span>JS SCRIPT</span>
            </label>
          </div>
        </div>

        {/* Template Input */}
        {payloadMode === 'script' ? (
          <textarea
            ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
            value={templateText}
            onChange={(e) => onChangeTemplateText(e.target.value)}
            disabled={isRunning}
            className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-sky-500 h-24 resize-y"
            placeholder={'// e.g.,\nfunction generatePacket(num) {\n  return "PIN:" + num + "\\r\\n";\n}'}
            spellCheck={false}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={templateText}
            onChange={(e) => onChangeTemplateText(e.target.value)}
            disabled={isRunning}
            className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2.5 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-sky-500 h-8"
            placeholder={payloadMode === "hex" ? 'AA 55 {HEX:2} 00 FF' : 'PIN:{DEC:4}\\r\\n'}
            spellCheck={false}
          />
        )}

        {payloadMode === 'script' && (
          <div className="text-amber-500/90 text-[10px] font-bold mb-1">
            {t.scriptWarning}
          </div>
        )}

        {/* Macro Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
          <span className="text-[#64748B] text-[10px]">{t.macroLabel}</span>
          <button
            type="button"
            onClick={() => insertMacro('{NUM}')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#38BDF8] border border-[#1E293B] rounded"
          >
            {'{NUM}'}
          </button>
          <button
            type="button"
            onClick={() => insertMacro('{DEC:4}')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#34D399] border border-[#1E293B] rounded"
          >
            {'{DEC:4}'}
          </button>
          <button
            type="button"
            onClick={() => insertMacro('{HEX:2}')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#F59E0B] border border-[#1E293B] rounded"
          >
            {'{HEX:2}'}
          </button>
          <button
            type="button"
            onClick={() => insertMacro('{HEX:4}')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#F59E0B] border border-[#1E293B] rounded"
          >
            {'{HEX:4}'}
          </button>
          <button
            type="button"
            onClick={() => insertMacro('\\r')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] rounded"
          >
            \r
          </button>
          <button
            type="button"
            onClick={() => insertMacro('\\n')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] rounded"
          >
            \n
          </button>
          <button
            type="button"
            onClick={() => insertMacro('\\r\\n')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] rounded"
          >
            \r\n
          </button>
          <button
            type="button"
            onClick={() => insertMacro('\\0')}
            className="px-1.5 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] rounded"
          >
            \0
          </button>
        </div>

        {/* Live Packet Inspector */}
        <div className="bg-[#070B14] border border-[#1E293B] rounded p-2 text-left space-y-1">
          <div className="text-[9px] font-bold text-[#64748B]">
            {t.inspectorLabel}
          </div>
          <div className="text-xs font-bold text-[#38BDF8] truncate">
            {previewPacket.packetText || '<EMPTY>'}
          </div>
          <div className="text-[10px] text-[#34D399] font-mono break-all">
            {previewPacket.packetHex || '<NO_BYTES>'}
          </div>
        </div>
      </div>

      {/* ================= 2. RANGE & TIMING ================= */}
      <div className="bg-[#111A2E] border border-[#1E293B] rounded p-3 space-y-2">
        <span className="font-bold text-[11px] text-[#38BDF8]">
          {t.sec2Header}
        </span>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <span className="text-[9px] text-[#64748B] block">{t.startLabel}</span>
            <input
              type="number"
              value={startNum}
              disabled={isRunning}
              onChange={(e) => onChangeStartNum(Number(e.target.value))}
              className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 disabled:opacity-60"
            />
          </div>

          <div>
            <span className="text-[9px] text-[#64748B] block">{t.endLabel}</span>
            <input
              type="number"
              value={endNum}
              disabled={isRunning}
              onChange={(e) => onChangeEndNum(Number(e.target.value))}
              className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 disabled:opacity-60"
            />
          </div>

          <div>
            <span className="text-[9px] text-[#64748B] block">{t.stepLabel}</span>
            <input
              type="number"
              value={step}
              disabled={isRunning}
              onChange={(e) => onChangeStep(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 disabled:opacity-60"
            />
          </div>

          <div>
            <span className="text-[9px] text-[#64748B] block">{t.delayLabel}</span>
            <input
              type="number"
              value={delayMs}
              onChange={(e) => onChangeDelayMs(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Progress Display */}
        <div className="pt-1">
          <div className="text-center text-[10px] text-[#94A3B8] mb-1">
            {progressPercent.toFixed(1)}% ({currentSeqNumber} / {endNum})
          </div>
          <div className="w-full bg-[#070B14] border border-[#1E293B] rounded h-2 overflow-hidden">
            <div
              className="bg-[#10B981] h-full transition-all duration-100 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= 3. STOP CRITERIA ================= */}
      <div className="bg-[#111A2E] border border-[#1E293B] rounded p-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={stopOnMatch}
            onChange={(e) => onChangeStopOnMatch(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="font-bold text-[10px] text-[#34D399]">
            {t.stopOnMatch}
          </span>
        </label>

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5">
            <select
              value={matchMode}
              onChange={(e) => onChangeMatchMode(e.target.value as MatchMode)}
              className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="contains">{t.matchModes.contains}</option>
              <option value="exact_hex">{t.matchModes.exact_hex}</option>
              <option value="regex">{t.matchModes.regex}</option>
              <option value="any">{t.matchModes.any}</option>
            </select>
          </div>

          <div className="col-span-7">
            <input
              type="text"
              value={stopPattern}
              onChange={(e) => onChangeStopPattern(e.target.value)}
              placeholder="ACCESS_GRANTED|OK|SUCCESS"
              className="w-full bg-[#070B14] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <p className="text-[9px] text-[#64748B]">{t.triggerHint}</p>
      </div>

      {/* ================= CONTROL BUTTONS ================= */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-3 gap-2">
          {/* Start Button */}
          <button
            type="button"
            onClick={onStart}
            disabled={isRunning && !isPaused}
            className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {t.startBtn}
          </button>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            disabled={!isRunning}
            className="bg-[#B45309] hover:bg-[#92400E] text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPaused ? t.resumeBtn : t.pauseBtn}
          </button>

          {/* Stop Button */}
          <button
            type="button"
            onClick={onStop}
            disabled={!isRunning && !isPaused}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-2 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {t.stopBtn}
          </button>
        </div>

        {/* Single Probe Button */}
        <button
          type="button"
          onClick={onSingleProbe}
          className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold py-1.5 px-3 rounded text-xs transition-colors shadow-sm"
        >
          {t.probeBtn}
        </button>
      </div>
      </div>
    </div>
  );
};
