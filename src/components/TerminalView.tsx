import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AppLanguage, LogEntry } from '../types';
import { I18N } from '../data/i18n';
import { ProtocolType, parseProtocol } from '../utils/protocolParsers';
import { exportLogsToCsv, exportLogsToPcap } from '../utils/exportUtils';

interface TerminalViewProps {
  lang: AppLanguage;
  logs: LogEntry[];
  autoScroll: boolean;
  onChangeAutoScroll: (autoScroll: boolean) => void;
  onClearLogs: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  lang,
  logs,
  autoScroll,
  onChangeAutoScroll,
  onClearLogs,
}) => {
  const t = I18N[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // New states for parsing and filtering
  const [activeParser, setActiveParser] = useState<ProtocolType>('none');
  const [excludeFilter, setExcludeFilter] = useState('');
  const [highlightBlue, setHighlightBlue] = useState('');
  const [highlightRed, setHighlightRed] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenLogs, setFrozenLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (autoScroll && scrollRef.current && !isFrozen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isFrozen]);

  const toggleFreeze = () => {
    if (isFrozen) {
      setIsFrozen(false);
      setFrozenLogs([]);
    } else {
      setFrozenLogs(logs);
      setIsFrozen(true);
    }
  };

  const actualLogs = isFrozen ? frozenLogs : logs;

  const handleCopyLogs = () => {
    const text = actualLogs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.type.toUpperCase()}] > HEX: [${l.hex}] | ASCII: "${l.text}"`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const displayLogs = useMemo(() => {
    return actualLogs.filter((log) => {
      if (!excludeFilter) return true;
      try {
        const regex = new RegExp(excludeFilter, 'i');
        return !regex.test(log.text) && !regex.test(log.hex);
      } catch {
        return (
          !log.text.toLowerCase().includes(excludeFilter.toLowerCase()) &&
          !log.hex.toLowerCase().includes(excludeFilter.toLowerCase())
        );
      }
    });
  }, [actualLogs, excludeFilter]);

  const checkHighlight = (log: LogEntry, filter: string): boolean => {
    if (!filter) return false;
    try {
      const regex = new RegExp(filter, 'i');
      return regex.test(log.text) || regex.test(log.hex);
    } catch {
      return (
        log.text.toLowerCase().includes(filter.toLowerCase()) ||
        log.hex.toLowerCase().includes(filter.toLowerCase())
      );
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-md p-3 font-mono flex flex-col flex-1 min-h-[300px]">
      {/* Header & Controls */}
      <div className="flex flex-col gap-2 pb-2 mb-2 border-b border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] text-[#38BDF8]">
              {t.terminalHeader || 'TERMINAL LOGS'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#0C4A6E] border border-[#0284C7] text-[9px] font-bold text-[#38BDF8]">
              TX + RX
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#64748B]">
              {displayLogs.length} / {logs.length}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2 py-0.5 border rounded text-[10px] transition-colors ${
                showFilters || excludeFilter || highlightBlue || highlightRed || activeParser !== 'none'
                  ? 'bg-[#1E293B] text-sky-400 border-sky-500/50'
                  : 'bg-[#070B14] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
              }`}
            >
              {lang === 'ru' ? 'Фильтры & Парсеры' : lang === 'ua' ? 'Фільтри & Парсери' : 'Filters & Parsers'}
            </button>
            <button
              onClick={toggleFreeze}
              className={`px-2 py-0.5 border rounded text-[10px] transition-colors ${
                isFrozen
                  ? 'bg-sky-900/40 text-sky-400 border-sky-500/50'
                  : 'bg-[#070B14] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]'
              }`}
            >
              {isFrozen ? t.unfreezeBtn : t.freezeBtn}
            </button>
            <label className="flex items-center gap-1 text-[#94A3B8] cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => onChangeAutoScroll(e.target.checked)}
                className="accent-sky-500"
              />
              <span>{t.autoScroll}</span>
            </label>
            <button
              onClick={handleCopyLogs}
              className="px-2 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] rounded text-[10px] transition-colors"
            >
              {copied ? t.copiedBtn : t.copyBtn}
            </button>
            
            <button
              onClick={() => exportLogsToCsv(actualLogs)}
              className="px-2 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] rounded text-[10px] transition-colors"
            >
              {t.exportCsvBtnTerminal}
            </button>
            <button
              onClick={() => exportLogsToPcap(actualLogs)}
              className="px-2 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] rounded text-[10px] transition-colors"
            >
              {t.exportPcapBtn}
            </button>
            <button
              onClick={() => {
                setFrozenLogs([]);
                onClearLogs();
              }}

              className="px-2 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] rounded text-[10px] transition-colors"
            >
              {t.clearBtn}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex items-center gap-3 bg-[#070B14] p-2 rounded border border-[#1E293B] text-[10px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] uppercase font-bold">Parser:</span>
              <select
                value={activeParser}
                onChange={(e) => setActiveParser(e.target.value as ProtocolType)}
                className="bg-[#0F172A] border border-[#1E293B] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-sky-500"
              >
                <option value="none">Raw (None)</option>
                <option value="modbus">Modbus RTU</option>
                <option value="can">CAN Bus</option>
                <option value="nmea">NMEA (GPS)</option>
              </select>
            </div>
            
            <div className="w-px h-4 bg-[#1E293B] hidden sm:block"></div>
            
            <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
              <span className="text-slate-400 uppercase font-bold">Hide:</span>
              <input
                type="text"
                value={excludeFilter}
                onChange={(e) => setExcludeFilter(e.target.value)}
                placeholder="e.g. PING"
                className="flex-1 min-w-[60px] bg-[#0F172A] border border-[#1E293B] text-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-slate-500 placeholder-slate-600"
                spellCheck={false}
              />
            </div>

            <div className="w-px h-4 bg-[#1E293B] hidden sm:block"></div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
              <span className="text-sky-400/80 uppercase font-bold">Hi (Blue):</span>
              <input
                type="text"
                value={highlightBlue}
                onChange={(e) => setHighlightBlue(e.target.value)}
                placeholder="e.g. INIT"
                className="flex-1 min-w-[60px] bg-[#0F172A] border border-[#1E293B] text-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-sky-500 placeholder-slate-600"
                spellCheck={false}
              />
            </div>
            
            <div className="w-px h-4 bg-[#1E293B] hidden sm:block"></div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
              <span className="text-rose-400/80 uppercase font-bold">Hi (Red):</span>
              <input
                type="text"
                value={highlightRed}
                onChange={(e) => setHighlightRed(e.target.value)}
                placeholder="e.g. ERROR"
                className="flex-1 min-w-[60px] bg-[#0F172A] border border-[#1E293B] text-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-rose-500 placeholder-slate-600"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Terminal Monospace Stream Output */}
      <div
        ref={scrollRef}
        className="flex-1 bg-[#060A12] border border-[#1E293B] rounded p-2.5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1"
      >
        {displayLogs.length === 0 ? (
          <div className="text-slate-600 text-xs py-4 text-center">
            {lang === 'ru'
              ? 'Терминал пуст. Запустите перебор или отправьте проверочный пакет.'
              : lang === 'ua'
              ? 'Термінал порожній. Запустіть перебір або надішліть тестовий пакет.'
              : 'Terminal stream empty. Press START or send a probe packet.'}
          </div>
        ) : (
          displayLogs.map((log) => {
            const isBlue = checkHighlight(log, highlightBlue);
            const isRed = checkHighlight(log, highlightRed);
            
            let hlClass = '';
            if (isRed) hlClass = 'bg-rose-900/30 border border-rose-500/30 rounded px-1 -mx-1';
            else if (isBlue) hlClass = 'bg-sky-900/30 border border-sky-500/30 rounded px-1 -mx-1';

            const parsedStr = parseProtocol(activeParser, log.hex, log.text);

            if (log.type === 'tx') {
              return (
                <div key={log.id} className={`text-slate-300 ${hlClass}`}>
                  <span className="text-[#64748B]">[{log.timestamp}]</span>{' '}
                  <span className="text-[#38BDF8] font-bold">[TX] &gt;</span>{' '}
                  {parsedStr ? (
                    <span className="text-fuchsia-400 font-bold">{parsedStr}</span>
                  ) : (
                    <>
                      <span className="text-slate-400">HEX:</span>{' '}
                      <span className="text-[#34D399]">[{log.hex}]</span>{' '}
                      <span className="text-slate-400">| ASCII:</span>{' '}
                      <span className="text-[#38BDF8]">"{log.text}"</span>
                    </>
                  )}
                </div>
              );
            }
            if (log.type === 'rx') {
              return (
                <div key={log.id} className={`text-slate-300 ${hlClass}`}>
                  <span className="text-[#64748B]">[{log.timestamp}]</span>{' '}
                  <span className="text-[#34D399] font-bold">[RX] &lt;</span>{' '}
                  {parsedStr ? (
                    <span className="text-fuchsia-400 font-bold">{parsedStr}</span>
                  ) : (
                    <>
                      <span className="text-slate-400">HEX:</span>{' '}
                      <span className="text-[#A7F3D0]">[{log.hex}]</span>{' '}
                      <span className="text-slate-400">| ASCII:</span>{' '}
                      <span className="text-[#6EE7B7]">"{log.text}"</span>
                    </>
                  )}
                </div>
              );
            }
            if (log.type === 'match') {
              return (
                <div
                  key={log.id}
                  className="text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded font-bold"
                >
                  <span className="text-[#64748B]">[{log.timestamp}]</span> 🎯{' '}
                  {log.text}
                </div>
              );
            }
            if (log.type === 'error') {
              return (
                <div key={log.id} className="text-rose-400">
                  <span className="text-[#64748B]">[{log.timestamp}]</span>{' '}
                  <span className="font-bold">[ERROR]</span> {log.text}
                </div>
              );
            }
            return (
              <div key={log.id} className="text-[#94A3B8]">
                <span className="text-[#64748B]">[{log.timestamp}]</span>{' '}
                <span className="font-bold">[SYS]</span> {log.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
