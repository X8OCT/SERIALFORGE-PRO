import React from 'react';
import { X, Usb, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { AppLanguage, SerialPortConfig } from '../types';

interface PortConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  config: SerialPortConfig;
  onChangeConfig: (newConfig: SerialPortConfig) => void;
  isConnected: boolean;
  isSimulated: boolean;
  onConnectHardware: () => void;
  onDisconnect: () => void;
  onQuickSimulate: () => void;
  isWebSerialSupported: boolean;
}

const COMMON_BAUDRATES = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export const PortConfigModal: React.FC<PortConfigModalProps> = ({
  isOpen,
  onClose,
  lang,
  config,
  onChangeConfig,
  isConnected,
  isSimulated,
  onConnectHardware,
  onDisconnect,
  onQuickSimulate,
  isWebSerialSupported,
}) => {
  if (!isOpen) return null;
  const isRu = lang === 'ru';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155] bg-[#0A0F1B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                {isRu ? 'Конфигурация COM-порта' : 'Serial Port Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRu ? 'Параметры UART / RS-232 / RS-485' : 'UART / RS-232 / RS-485 physical parameters'}
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
          {/* Baud Rate */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {isRu ? 'Скорость передачи (Baudrate)' : 'Baud Rate (bps)'}
            </label>
            <select
              value={config.baudRate}
              onChange={(e) => onChangeConfig({ ...config, baudRate: Number(e.target.value) })}
              disabled={isConnected}
              className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400 font-mono"
            >
              {COMMON_BAUDRATES.map((rate) => (
                <option key={rate} value={rate} className="bg-[#0F172A]">
                  {rate} baud {rate === 115200 ? '(Standard High-Speed)' : rate === 9600 ? '(Standard Legacy)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Grid settings */}
          <div className="grid grid-cols-2 gap-3">
            {/* Data Bits */}
            <div>
              <label className="block text-slate-400 mb-1">{isRu ? 'Биты данных' : 'Data Bits'}</label>
              <select
                value={config.dataBits}
                onChange={(e) => onChangeConfig({ ...config, dataBits: Number(e.target.value) as 7 | 8 })}
                disabled={isConnected}
                className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
              >
                <option value={8}>8 Data Bits (Standard)</option>
                <option value={7}>7 Data Bits</option>
              </select>
            </div>

            {/* Stop Bits */}
            <div>
              <label className="block text-slate-400 mb-1">{isRu ? 'Стоп-биты' : 'Stop Bits'}</label>
              <select
                value={config.stopBits}
                onChange={(e) => onChangeConfig({ ...config, stopBits: Number(e.target.value) as 1 | 2 })}
                disabled={isConnected}
                className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
              >
                <option value={1}>1 Stop Bit (Standard)</option>
                <option value={2}>2 Stop Bits</option>
              </select>
            </div>

            {/* Parity */}
            <div>
              <label className="block text-slate-400 mb-1">{isRu ? 'Четность (Parity)' : 'Parity'}</label>
              <select
                value={config.parity}
                onChange={(e) => onChangeConfig({ ...config, parity: e.target.value as any })}
                disabled={isConnected}
                className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
              >
                <option value="none">None (Без четности)</option>
                <option value="even">Even (Четный)</option>
                <option value="odd">Odd (Нечетный)</option>
              </select>
            </div>

            {/* Flow Control */}
            <div>
              <label className="block text-slate-400 mb-1">{isRu ? 'Управление потоком' : 'Flow Control'}</label>
              <select
                value={config.flowControl}
                onChange={(e) => onChangeConfig({ ...config, flowControl: e.target.value as any })}
                disabled={isConnected}
                className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
              >
                <option value="none">None (Отключено)</option>
                <option value="hardware">RTS/CTS (Hardware)</option>
              </select>
            </div>
          </div>

          {/* Buffer Size */}
          <div>
            <label className="block text-slate-400 mb-1">{isRu ? 'Размер буфера (Rx/Tx bytes)' : 'Buffer Size (bytes)'}</label>
            <input
              type="number"
              value={config.bufferSize}
              onChange={(e) => onChangeConfig({ ...config, bufferSize: Math.max(256, Number(e.target.value)) })}
              disabled={isConnected}
              className="w-full bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-sky-400"
            />
          </div>

          {/* Web Serial Support Notice */}
          {!isWebSerialSupported && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                {isRu
                  ? 'Web Serial API не доступен напрямую в этом окружении браузера. Вы можете использовать виртуальный симулятор прямо сейчас или скомпилировать приложенный проект C# WPF для работы с любыми физическими COM-портами в Windows.'
                  : 'Web Serial API is not accessible in this browser context. You can use the built-in simulator or the standalone C# WPF app to connect to real hardware ports in Windows.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-[#334155] bg-[#0A0F1B] flex flex-wrap items-center justify-between gap-2">
          {isConnected ? (
            <button
              onClick={() => {
                onDisconnect();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 text-xs font-mono font-bold transition-colors"
            >
              {isRu ? 'Отключить порт' : 'Disconnect Port'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onConnectHardware();
                  onClose();
                }}
                disabled={!isWebSerialSupported}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{isRu ? 'Выбрать USB/COM' : 'Select Serial Port'}</span>
              </button>

              <button
                onClick={() => {
                  onQuickSimulate();
                  onClose();
                }}
                className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-mono font-bold transition-colors flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isRu ? 'Тест в симуляторе' : 'Virtual Simulator'}</span>
              </button>
            </div>
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
