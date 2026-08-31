import React from 'react';
import { X, Radio, KeyRound, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { AppLanguage, HardwareSimulatorConfig } from '../types';

interface SimulatorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  config: HardwareSimulatorConfig;
  onChangeConfig: (config: HardwareSimulatorConfig) => void;
  isConnected: boolean;
  isSimulated: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
}

export const SimulatorConfigModal: React.FC<SimulatorConfigModalProps> = ({
  isOpen,
  onClose,
  lang,
  config,
  onChangeConfig,
  isConnected,
  isSimulated,
  onStartSimulation,
  onStopSimulation,
}) => {
  if (!isOpen) return null;
  const isRu = lang === 'ru';

  const randomizeSecret = () => {
    // Generate random 16-bit number
    const rand = Math.floor(Math.random() * 65535);
    onChangeConfig({ ...config, secretCode: rand });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155] bg-[#0A0F1B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                {isRu ? 'Виртуальный симулятор COM-устройства' : 'Virtual Hardware Simulator'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRu ? 'Эмуляция платы микроконтроллера для тестирования без проводов' : 'Emulates target hardware controller with secret password'}
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

        {/* Body */}
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Target Secret Code */}
          <div className="p-3.5 bg-[#0A0F1B] rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5 text-amber-400">
                <KeyRound className="w-4 h-4" />
                <span>{isRu ? 'Секретный код / Пароль в памяти платы:' : 'Hardware Target Secret Key:'}</span>
              </label>
              <button
                onClick={randomizeSecret}
                className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-[10px] transition-colors"
              >
                {isRu ? 'Случайный' : 'Randomize'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px]">DEC:</span>
                <input
                  type="number"
                  value={config.secretCode}
                  onChange={(e) => onChangeConfig({ ...config, secretCode: Number(e.target.value) })}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded px-2.5 py-1.5 text-amber-300 font-bold font-mono focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <span className="text-slate-500 text-[10px]">HEX:</span>
                <div className="w-full bg-[#0F172A] border border-[#334155] rounded px-2.5 py-1.5 text-emerald-400 font-bold font-mono">
                  0x{config.secretCode.toString(16).toUpperCase().padStart(4, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Response Delay */}
          <div>
            <label className="block text-slate-300 mb-1">
              {isRu ? 'Задержка ответа платы (мс)' : 'Target Response Latency (ms)'}
            </label>
            <input
              type="number"
              value={config.responseDelayMs}
              onChange={(e) => onChangeConfig({ ...config, responseDelayMs: Math.max(1, Number(e.target.value)) })}
              className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
            />
          </div>

          {/* Protocol Type */}
          <div>
            <label className="block text-slate-300 mb-1">
              {isRu ? 'Тип имитируемого протокола' : 'Simulated Response Format'}
            </label>
            <select
              value={config.packetStructure}
              onChange={(e) => onChangeConfig({ ...config, packetStructure: e.target.value as any })}
              className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
            >
              <option value="binary_custom">Текстовый ответ [OK:KEY_FOUND] при успехе / NACK при ошибке</option>
              <option value="modbus">Modbus RTU (Ответ 0x83 Exception при неверном коде)</option>
              <option value="nmea">NMEA ($ERR / $OK)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#334155] bg-[#0A0F1B] flex items-center justify-between">
          {isSimulated ? (
            <button
              onClick={() => {
                onStopSimulation();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 text-xs font-mono font-bold transition-colors"
            >
              {isRu ? 'Остановить симулятор' : 'Stop Simulator'}
            </button>
          ) : (
            <button
              onClick={() => {
                onStartSimulation();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-extrabold transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>{isRu ? 'Подключить симулятор' : 'Start Simulator'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs font-mono transition-colors"
          >
            {isRu ? 'Закрыть' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
