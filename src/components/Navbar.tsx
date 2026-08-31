import React from 'react';
import { Cpu, Code2, RefreshCw, Radio, Terminal, Skull } from 'lucide-react';
import { AppLanguage, SerialPortConfig } from '../types';
import { PRESET_PROFILES } from '../data/presets';
import { I18N } from '../data/i18n';

interface NavbarProps {
  lang: AppLanguage;
  isConnected: boolean;
  isSimulated: boolean;
  portConfig: SerialPortConfig;
  onChangePortConfig: (cfg: SerialPortConfig) => void;
  selectedPresetIndex: number;
  onSelectPresetIndex: (idx: number) => void;
  onConnectHardware: () => void;
  onConnectSimulator: () => void;
  onDisconnect: () => void;
  onOpenCsharp: () => void;
  onOpenSimModal: () => void;
  hitsCount: number;
  speedPerSec: number;
  isWebSerialSupported: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  isConnected,
  isSimulated,
  portConfig,
  onChangePortConfig,
  selectedPresetIndex,
  onSelectPresetIndex,
  onConnectHardware,
  onConnectSimulator,
  onDisconnect,
  onOpenCsharp,
  onOpenSimModal,
  hitsCount,
  speedPerSec,
  isWebSerialSupported,
}) => {
  const t = I18N[lang];

  return (
    <header className="bg-[#0F172A] border-b border-[#1E293B] px-3 py-2">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-md border border-emerald-500/60 bg-[#070B14] overflow-hidden flex items-center justify-center shadow-sm shadow-emerald-950/40 relative text-emerald-500">
            <Skull size={22} strokeWidth={1.5} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-emerald-400 font-mono tracking-wider">
                {t.title}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#022C22] text-[#34D399] border border-[#059669]">
                {t.badge}
              </span>
            </div>
            <p className="text-[9px] text-[#64748B] font-mono tracking-tight hidden sm:block uppercase">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Presets & Port Connection Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="bg-[#070B14] border border-[#1E293B] rounded px-2.5 py-1 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#38BDF8] font-mono">
              {t.presetLabel}
            </span>
            <select
              value={selectedPresetIndex}
              onChange={(e) => onSelectPresetIndex(Number(e.target.value))}
              className="bg-[#0F172A] text-xs text-slate-200 border border-[#1E293B] rounded px-2 py-0.5 font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {PRESET_PROFILES.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {lang === 'ru' ? p.nameRu : lang === 'ua' ? p.nameUa : p.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Port & Baud */}
          <div className="bg-[#070B14] border border-[#1E293B] rounded px-2.5 py-1 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B] font-mono">
              {t.portLabel}
            </span>

            {/* Connection Mode / Port display */}
            <span className="text-xs font-mono text-slate-300 bg-[#0F172A] border border-[#1E293B] px-2 py-0.5 rounded">
              {isConnected
                ? isSimulated
                  ? 'SIM_VIRTUAL'
                  : 'USB_SERIAL'
                : 'NO_PORT'}
            </span>

            <span className="text-[10px] font-bold text-[#64748B] font-mono ml-1">
              {t.baudLabel}
            </span>

            <select
              value={portConfig.baudRate}
              onChange={(e) =>
                onChangePortConfig({
                  ...portConfig,
                  baudRate: Number(e.target.value),
                })
              }
              disabled={isConnected}
              className="bg-[#0F172A] text-xs text-slate-200 border border-[#1E293B] rounded px-2 py-0.5 font-mono focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-60"
            >
              <option value="9600">9600</option>
              <option value="19200">19200</option>
              <option value="38400">38400</option>
              <option value="57600">57600</option>
              <option value="115200">115200</option>
              <option value="230400">230400</option>
              <option value="460800">460800</option>
              <option value="921600">921600</option>
              <option value="1000000">1000000</option>
            </select>

            {/* Connect / Disconnect Buttons */}
            {isConnected ? (
              <button
                onClick={onDisconnect}
                className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-600/80 px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors"
              >
                {t.disconnectBtn}
              </button>
            ) : (
              <div className="flex items-center gap-1">
                {isWebSerialSupported ? (
                  <button
                    onClick={onConnectHardware}
                    className="bg-[#0369A1] hover:bg-[#0284C7] text-white border border-[#38BDF8] px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors"
                    title={
                      lang === 'ru'
                        ? 'Выбрать физический USB-UART порт'
                        : lang === 'ua'
                        ? 'Вибрати фізичний USB-UART порт'
                        : 'Select physical USB-UART port'
                    }
                  >
                    {t.connectBtn}
                  </button>
                ) : null}

                <button
                  onClick={onConnectSimulator}
                  className="bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border border-amber-500/80 px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors flex items-center gap-1"
                  title={
                    lang === 'ru'
                      ? 'Подключить встроенный виртуальный симулятор'
                      : lang === 'ua'
                      ? 'Підключити вбудований віртуальний симулятор'
                      : 'Connect built-in virtual simulator'
                  }
                >
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>{t.simulatorBadge}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Badges & Tools */}
        <div className="flex items-center gap-2">
          {/* Hits Badge */}
          <div className="bg-[#064E3B] border border-[#059669] rounded px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="text-[#A7F3D0]">{t.hitsLabel}</span>
            <span className="text-[#34D399]">{hitsCount}</span>
          </div>

          {/* Speed Badge */}
          <div className="bg-[#0C4A6E] border border-[#0284C7] rounded px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="text-[#BAE6FD]">{t.speedLabel}</span>
            <span className="text-[#38BDF8]">{speedPerSec} pkt/s</span>
          </div>

          {/* Status Badge with LED */}
          <div className="bg-[#1E1B4B] border border-[#312E81] rounded px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? isSimulated
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                  : 'bg-rose-500'
              }`}
            />
            <span
              className={
                isConnected
                  ? isSimulated
                    ? 'text-amber-300'
                    : 'text-emerald-300'
                  : 'text-slate-400'
              }
            >
              {isConnected
                ? isSimulated
                  ? t.simulatorBadge
                  : t.onlineBadge
                : t.offlineBadge}
            </span>
          </div>

          {/* Simulator Config Modal Trigger */}
          <button
            onClick={onOpenSimModal}
            className="p-1.5 bg-[#070B14] hover:bg-[#1E293B] text-amber-400 border border-[#1E293B] rounded transition-colors"
            title={t.simBtn}
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          {/* C# WPF Source Modal Trigger */}
          <button
            onClick={onOpenCsharp}
            className="px-2 py-1 bg-[#070B14] hover:bg-[#022C22] text-emerald-300 border border-emerald-600/60 rounded text-[10px] font-mono font-bold transition-colors flex items-center gap-1"
            title={t.csharpBtn}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">C# WPF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
