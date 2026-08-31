import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SequencerPanel } from './components/SequencerPanel';
import { TerminalView } from './components/TerminalView';
import { HitsPanel } from './components/HitsPanel';
import { BottomBar } from './components/BottomBar';
import { SimulatorConfigModal } from './components/SimulatorConfigModal';
import { CsharpModal } from './components/CsharpModal';
import { PRESET_PROFILES } from './data/presets';
import { I18N } from './data/i18n';
import {
  AppLanguage,
  HardwareSimulatorConfig,
  PayloadMode,
  HitResult,
  LogEntry,
  MatchMode,
  SerialPortConfig,
} from './types';
import { buildDynamicPacket, formatHex } from './utils/packetBuilder';
import { SerialManager } from './utils/serialService';

const STORAGE_KEY = 'serialforge_web_config_v2';

export function App() {
  // 1. Language State
  const [lang, setLang] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language && ['ru', 'ua', 'en'].includes(parsed.language)) {
          return parsed.language;
        }
      }
    } catch {}
    return 'ru';
  });

  const t = I18N[lang];

  // 2. Port Configuration
  const [portConfig, setPortConfig] = useState<SerialPortConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.baudRate) {
          return {
            baudRate: parsed.baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none',
            bufferSize: 4096,
          };
        }
      }
    } catch {}
    return {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      bufferSize: 4096,
    };
  });

  // 3. Attack Configuration & Presets
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.selectedPresetIndex === 'number') {
          return parsed.selectedPresetIndex;
        }
      }
    } catch {}
    return 0;
  });

  const [payloadMode, setPayloadMode] = useState<PayloadMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).payloadMode === "string") {
        return JSON.parse(saved).payloadMode;
      }
    } catch {}
    return PRESET_PROFILES[0].payloadMode || (PRESET_PROFILES[0].isHexMode ? "hex" : "text");
  });

  const [templateText, setTemplateText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && JSON.parse(saved).templateText) {
        return JSON.parse(saved).templateText;
      }
    } catch {}
    return PRESET_PROFILES[0].template;
  });

  const [startNum, setStartNum] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).startNum === 'number') {
        return JSON.parse(saved).startNum;
      }
    } catch {}
    return PRESET_PROFILES[0].startNum;
  });

  const [endNum, setEndNum] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).endNum === 'number') {
        return JSON.parse(saved).endNum;
      }
    } catch {}
    return PRESET_PROFILES[0].endNum;
  });

  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).step === 'number') {
        return JSON.parse(saved).step;
      }
    } catch {}
    return PRESET_PROFILES[0].step;
  });

  const [delayMs, setDelayMs] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).delayMs === 'number') {
        return JSON.parse(saved).delayMs;
      }
    } catch {}
    return PRESET_PROFILES[0].delayMs;
  });

  const [stopOnMatch, setStopOnMatch] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).stopOnMatch === 'boolean') {
        return JSON.parse(saved).stopOnMatch;
      }
    } catch {}
    return true;
  });

  const [matchMode, setMatchMode] = useState<MatchMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && JSON.parse(saved).matchMode) {
        return JSON.parse(saved).matchMode;
      }
    } catch {}
    return PRESET_PROFILES[0].matchMode;
  });

  const [stopPattern, setStopPattern] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && JSON.parse(saved).stopPattern) {
        return JSON.parse(saved).stopPattern;
      }
    } catch {}
    return PRESET_PROFILES[0].stopPattern;
  });

  const [autoScroll, setAutoScroll] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof JSON.parse(saved).autoScroll === 'boolean') {
        return JSON.parse(saved).autoScroll;
      }
    } catch {}
    return true;
  });

  // 4. Simulator Configuration
  const [simulatorConfig, setSimulatorConfig] = useState<HardwareSimulatorConfig>({
    enabled: true,
    secretCode: 1337,
    responseDelayMs: 10,
    stopPattern: 'ACCESS_GRANTED|OK|SUCCESS',
  });

  // 5. App Runtime State
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSeqNumber, setCurrentSeqNumber] = useState(startNum);
  const [statusText, setStatusText] = useState(t.statusReady);

  // 6. Logs & Hits
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hits, setHits] = useState<HitResult[]>([]);
  const [latestHit, setLatestHit] = useState<HitResult | null>(null);
  const [speedPerSec, setSpeedPerSec] = useState(0);

  // Modals
  const [isCsharpModalOpen, setIsCsharpModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Refs for non-blocking loop
  const serialManagerRef = useRef<SerialManager | null>(null);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const currentNumRef = useRef(startNum);
  const startTimeRef = useRef<number>(0);
  const sentCountRef = useRef(0);
  const speedIntervalRef = useRef<any>(null);

  // Save config changes to localStorage
  useEffect(() => {
    const configToSave = {
      language: lang,
      baudRate: portConfig.baudRate,
      selectedPresetIndex,
      payloadMode,
      templateText,
      startNum,
      endNum,
      step,
      delayMs,
      stopOnMatch,
      matchMode,
      stopPattern,
      autoScroll,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    } catch {}
  }, [
    lang,
    portConfig.baudRate,
    selectedPresetIndex,
    payloadMode,
    templateText,
    startNum,
    endNum,
    step,
    delayMs,
    stopOnMatch,
    matchMode,
    stopPattern,
    autoScroll,
  ]);

  // Log Appender
  const addLog = useCallback(
    (
      type: 'tx' | 'rx' | 'info' | 'error' | 'match' | 'system',
      hex: string,
      text: string,
      seqNumber?: number
    ) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;

      const entry: LogEntry = {
        id: `${Date.now()}_${Math.random()}`,
        timestamp: timeStr,
        type,
        hex,
        text,
        seqNumber,
      };

      setLogs((prev) => {
        const next = [...prev, entry];
        if (next.length > 600) {
          return next.slice(next.length - 600);
        }
        return next;
      });
    },
    []
  );

  // Initialize Serial Manager
  useEffect(() => {
    const mgr = new SerialManager({
      onReceive: (data, hex, text) => {
        addLog('rx', hex, text);
        evaluateResponseMatch(data, hex, text);
      },
      onError: (err) => {
        const msg = typeof err === 'string' ? err : err.message;
        addLog('error', '', msg);
        setStatusText(t.statusPortError);
      },
      onConnect: () => {
        setIsConnected(true);
        setIsSimulated(mgr.getIsSimulated());
        setStatusText(t.statusReady);
        addLog(
          'system',
          '',
          mgr.getIsSimulated()
            ? 'Виртуальный симулятор COM-порта подключен.'
            : 'Физический USB-UART порт успешно открыт.'
        );
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsSimulated(false);
        setIsRunning(false);
        runningRef.current = false;
        setStatusText(t.statusReady);
        addLog('system', '', 'Порт отключен.');
      },
    });

    serialManagerRef.current = mgr;

    // Connect simulator on startup for immediate interactive usage
    mgr.connectSimulator(simulatorConfig).catch(() => {});

    return () => {
      mgr.disconnect().catch(() => {});
    };
  }, []);

  // Update simulator config in serial manager
  useEffect(() => {
    if (serialManagerRef.current) {
      serialManagerRef.current.setSimulatorConfig(simulatorConfig);
    }
  }, [simulatorConfig]);

  // Response Trigger Match Evaluator
  const evaluateResponseMatch = (data: Uint8Array, hex: string, text: string) => {
    const pattern = stopPattern.trim();
    let isHit = false;

    if (matchMode === 'any') {
      isHit = data.length > 0;
    } else if (matchMode === 'exact_hex') {
      const cleanHex = hex.replace(/\s+/g, '').toUpperCase();
      const cleanPat = pattern.replace(/\s+/g, '').toUpperCase();
      isHit = Boolean(cleanPat) && (cleanHex === cleanPat || cleanHex.includes(cleanPat));
    } else if (matchMode === 'regex') {
      try {
        const re = new RegExp(pattern, 'i');
        isHit = re.test(text) || re.test(hex);
      } catch {
        isHit = false;
      }
    } else {
      // Default: contains string
      const subPatterns = pattern.split('|').map((s) => s.trim().toLowerCase());
      const lowerText = text.toLowerCase();
      isHit = subPatterns.some((p) => p && (lowerText.includes(p) || hex.toUpperCase().includes(p.toUpperCase())));
    }

    if (isHit) {
      const hitNum = currentNumRef.current;
      const keyHex = `0x${(hitNum & 0xffff).toString(16).toUpperCase()}`;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const packetInfo = buildDynamicPacket(templateText, hitNum, payloadMode);

      const hitResult: HitResult = {
        id: `hit_${Date.now()}_${Math.random()}`,
        time: timeStr,
        keyNum: hitNum,
        keyHex,
        sent: payloadMode ? packetInfo.packetHex : packetInfo.packetText,
        response: text.trim() || hex,
      };

      setHits((prev) => [hitResult, ...prev]);
      setLatestHit(hitResult);
      setStatusText(t.statusHit);
      addLog('match', hex, `[KEY MATCH: ${hitNum} (${keyHex})] > RESPONSE: ${text.trim() || hex}`, hitNum);

      if (stopOnMatch) {
        handleStop();
      }
    }
  };

  // Hardware Connection (Web Serial API)
  const handleConnectHardware = async () => {
    if (!serialManagerRef.current) return;
    try {
      await serialManagerRef.current.connectHardware(portConfig);
    } catch (e: any) {
      addLog('error', '', `${e.message}`);
    }
  };

  // Simulator Connection
  const handleConnectSimulator = async () => {
    if (!serialManagerRef.current) return;
    try {
      await serialManagerRef.current.connectSimulator(simulatorConfig);
    } catch (e: any) {
      addLog('error', '', `${e.message}`);
    }
  };

  const handleDisconnect = async () => {
    if (!serialManagerRef.current) return;
    await serialManagerRef.current.disconnect();
  };

  // Preset Selection Handler
  const handleSelectPresetIndex = (idx: number) => {
    const profile = PRESET_PROFILES[idx];
    if (!profile) return;

    setSelectedPresetIndex(idx);
    setPayloadMode(profile.payloadMode || (profile.isHexMode ? "hex" : "text"));
    setTemplateText(profile.template);
    setStartNum(profile.startNum);
    setEndNum(profile.endNum);
    setStep(profile.step);
    setDelayMs(profile.delayMs);
    setStopPattern(profile.stopPattern);
    setMatchMode(profile.matchMode);
    setPortConfig((prev) => ({ ...prev, baudRate: profile.baudRate }));

    currentNumRef.current = profile.startNum;
    setCurrentSeqNumber(profile.startNum);

    const pName = lang === 'ru' ? profile.nameRu : lang === 'ua' ? profile.nameUa : profile.nameEn;
    addLog('system', '', `Загружен пресет: ${pName}`);
  };

  // Start Attack Loop
  const handleStart = async () => {
    if (!isConnected) {
      await handleConnectSimulator();
    }

    setIsRunning(true);
    setIsPaused(false);
    runningRef.current = true;
    pausedRef.current = false;
    startTimeRef.current = Date.now();
    sentCountRef.current = 0;

    let num = currentSeqNumber;
    if (num < startNum || num >= endNum) {
      num = startNum;
      setCurrentSeqNumber(num);
    }
    currentNumRef.current = num;

    setStatusText(t.statusRunning);
    addLog(
      'system',
      '',
      `[START] Диапазон [${startNum}..${endNum}], шаг: ${step}, задержка: ${delayMs}мс`
    );

    // Speed counter timer
    if (speedIntervalRef.current) clearInterval(speedIntervalRef.current);
    speedIntervalRef.current = setInterval(() => {
      const elapsed = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
      setSpeedPerSec(Math.round(sentCountRef.current / elapsed));
    }, 500);

    runAttackLoop();
  };

  const runAttackLoop = async () => {
    while (runningRef.current) {
      if (pausedRef.current) {
        await new Promise((r) => setTimeout(r, 80));
        continue;
      }

      const num = currentNumRef.current;
      if (num > endNum) {
        setStatusText(t.statusFinished);
        addLog('system', '', 'Перебор диапазона завершен.');
        handleStop();
        break;
      }

      // Build and send packet
      const packet = buildDynamicPacket(templateText, num, payloadMode);
      try {
        if (serialManagerRef.current && serialManagerRef.current.isConnected()) {
          await serialManagerRef.current.send(packet.packetBytes);
          addLog('tx', packet.packetHex, packet.packetText, num);
          sentCountRef.current++;
        }
      } catch (err: any) {
        addLog('error', '', err.message);
      }

      // Increment sequence number
      const nextNum = num + step;
      currentNumRef.current = nextNum;
      setCurrentSeqNumber(nextNum);

      // Delay between packets
      await new Promise((r) => setTimeout(r, Math.max(1, delayMs)));
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    pausedRef.current = true;
    setStatusText(t.statusPaused);
    addLog('system', '', 'Перебор приостановлен.');
  };

  const handleResume = () => {
    setIsPaused(false);
    pausedRef.current = false;
    setStatusText(t.statusRunning);
    addLog('system', '', 'Перебор возобновлен.');
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    runningRef.current = false;
    pausedRef.current = false;
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
      speedIntervalRef.current = null;
    }
  };

  // Single Probe Packet
  const handleSingleProbe = async () => {
    if (!isConnected) {
      await handleConnectSimulator();
    }

    const num = currentSeqNumber;
    const packet = buildDynamicPacket(templateText, num, payloadMode);
    try {
      if (serialManagerRef.current) {
        await serialManagerRef.current.send(packet.packetBytes);
        addLog('tx', packet.packetHex, packet.packetText, num);
      }
    } catch (err: any) {
      addLog('error', '', err.message);
    }

    const nextNum = num + step;
    currentNumRef.current = nextNum;
    setCurrentSeqNumber(nextNum);
  };

  // Language Switcher cycle: RU -> UA -> EN -> RU
  const handleToggleLang = () => {
    setLang((curr) => {
      if (curr === 'ru') return 'ua';
      if (curr === 'ua') return 'en';
      return 'ru';
    });
  };

  const isWebSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  return (
    <div className="h-screen bg-[#080C14] text-[#E2E8F0] flex flex-col font-sans selection:bg-emerald-950 selection:text-emerald-200 overflow-hidden">
      {/* 1. Header Navigation Bar (Matches WPF Header) */}
      <Navbar
        lang={lang}
        isConnected={isConnected}
        isSimulated={isSimulated}
        portConfig={portConfig}
        onChangePortConfig={setPortConfig}
        selectedPresetIndex={selectedPresetIndex}
        onSelectPresetIndex={handleSelectPresetIndex}
        onConnectHardware={handleConnectHardware}
        onConnectSimulator={handleConnectSimulator}
        onDisconnect={handleDisconnect}
        onOpenCsharp={() => setIsCsharpModalOpen(true)}
        onOpenSimModal={() => setIsSimModalOpen(true)}
        hitsCount={hits.length}
        speedPerSec={speedPerSec}
        isWebSerialSupported={isWebSerialSupported}
      />

      {/* 2. Main Workspace Layout (2 Columns matching WPF) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Attack Vector & Configuration (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-0">
          <SequencerPanel
            lang={lang}
            payloadMode={payloadMode}
            onChangePayloadMode={setPayloadMode}
            templateText={templateText}
            onChangeTemplateText={setTemplateText}
            startNum={startNum}
            onChangeStartNum={(n) => {
              setStartNum(n);
              if (!isRunning) {
                setCurrentSeqNumber(n);
                currentNumRef.current = n;
              }
            }}
            endNum={endNum}
            onChangeEndNum={setEndNum}
            step={step}
            onChangeStep={setStep}
            delayMs={delayMs}
            onChangeDelayMs={setDelayMs}
            stopOnMatch={stopOnMatch}
            onChangeStopOnMatch={setStopOnMatch}
            matchMode={matchMode}
            onChangeMatchMode={setMatchMode}
            stopPattern={stopPattern}
            onChangeStopPattern={setStopPattern}
            isRunning={isRunning}
            isPaused={isPaused}
            currentSeqNumber={currentSeqNumber}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onSingleProbe={handleSingleProbe}
            isConnected={isConnected}
          />
        </div>

        {/* Right Column: Terminal Stream & Hits Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-0 gap-3">
          <TerminalView
            lang={lang}
            logs={logs}
            autoScroll={autoScroll}
            onChangeAutoScroll={setAutoScroll}
            onClearLogs={() => setLogs([])}
          />

          <HitsPanel
            lang={lang}
            hits={hits}
            latestHit={latestHit}
            onClearHits={() => {
              setHits([]);
              setLatestHit(null);
            }}
          />
        </div>
      </main>

      {/* 3. Bottom Telemetry & Status Bar (Matches WPF Bottom Bar) */}
      <BottomBar
        lang={lang}
        onToggleLang={handleToggleLang}
        statusText={statusText}
        isRunning={isRunning}
      />

      {/* Modals */}
      <SimulatorConfigModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        lang={lang === 'ua' ? 'ru' : lang}
        config={simulatorConfig}
        onChangeConfig={setSimulatorConfig}
        isConnected={isConnected}
        isSimulated={isSimulated}
        onStartSimulation={handleConnectSimulator}
        onStopSimulation={handleDisconnect}
      />

      <CsharpModal
        isOpen={isCsharpModalOpen}
        onClose={() => setIsCsharpModalOpen(false)}
        lang={lang === 'ua' ? 'ru' : lang}
      />
    </div>
  );
}

export default App;
