import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles, Hash } from 'lucide-react';
import { AppLanguage, ChecksumType, Endianness } from '../types';
import { calculateChecksum } from '../utils/checksums';
import { formatHex, parseHexString } from '../utils/packetBuilder';

interface ManualSenderProps {
  lang: AppLanguage;
  onSendBytes: (data: Uint8Array) => Promise<void>;
  isConnected: boolean;
}

export const ManualSender: React.FC<ManualSenderProps> = ({ lang, onSendBytes, isConnected }) => {
  const isRu = lang === 'ru';
  const [inputHex, setInputHex] = useState('AA 55 01 20 00 01 0D 0A');
  const [checksumType, setChecksumType] = useState<ChecksumType>('none');
  const [autoAppendChecksum, setAutoAppendChecksum] = useState(false);
  const [history, setHistory] = useState<string[]>(['AA 55 01 20 00 01 0D 0A', '01 03 00 00 00 01 84 0A']);

  const parsedBytes = parseHexString(inputHex);

  const calculatedCrc =
    checksumType !== 'none'
      ? calculateChecksum(parsedBytes, checksumType, 'little')
      : new Uint8Array(0);

  const handleSend = async () => {
    if (parsedBytes.length === 0) return;

    let payload = parsedBytes;
    if (autoAppendChecksum && calculatedCrc.length > 0) {
      const merged = new Uint8Array(parsedBytes.length + calculatedCrc.length);
      merged.set(parsedBytes, 0);
      merged.set(calculatedCrc, parsedBytes.length);
      payload = merged;
    }

    try {
      await onSendBytes(payload);
      if (!history.includes(inputHex)) {
        setHistory((prev) => [inputHex, ...prev.slice(0, 7)]);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#334155]/80 rounded-xl shadow-xl p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400" />
          <span>{isRu ? 'Ручная отправка пакета (Direct HEX Send)' : 'Manual Direct Packet Transmitter'}</span>
        </span>
        <span className="text-[11px] text-slate-400">
          {parsedBytes.length} {isRu ? 'байт' : 'bytes'}
        </span>
      </div>

      {/* Input Row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputHex}
          onChange={(e) => setInputHex(e.target.value)}
          placeholder="AA 55 01 FE 0D 0A"
          className="flex-1 bg-[#0A0F1B] border border-[#334155] rounded-lg px-3 py-2 text-sky-300 font-mono focus:border-sky-400 focus:outline-hidden uppercase"
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || parsedBytes.length === 0}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-sky-950/50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isRu ? 'ОТПРАВИТЬ' : 'SEND'}</span>
        </button>
      </div>

      {/* Live CRC Helper & Append Option */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0A0F1B] rounded border border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{isRu ? 'Вычислить CRC:' : 'Calc CRC:'}</span>
          <select
            value={checksumType}
            onChange={(e) => setChecksumType(e.target.value as ChecksumType)}
            className="bg-[#0F172A] border border-[#334155] rounded px-2 py-0.5 text-slate-200"
          >
            <option value="none">None</option>
            <option value="crc16_modbus">CRC-16 Modbus</option>
            <option value="crc16_ccitt">CRC-16 CCITT</option>
            <option value="crc8">CRC-8</option>
            <option value="sum8">Sum-8</option>
            <option value="xor8">XOR-8</option>
          </select>

          {calculatedCrc.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              {formatHex(calculatedCrc)}
            </span>
          )}
        </div>

        {checksumType !== 'none' && (
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={autoAppendChecksum}
              onChange={(e) => setAutoAppendChecksum(e.target.checked)}
              className="rounded bg-[#0F172A] border-[#334155] text-sky-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>{isRu ? 'Прикрепить CRC в конец' : 'Append CRC'}</span>
          </label>
        )}
      </div>

      {/* Recent History quick-picks */}
      {history.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-slate-500 text-[10px] shrink-0">{isRu ? 'История:' : 'History:'}</span>
          {history.map((h, i) => (
            <button
              key={i}
              onClick={() => setInputHex(h)}
              className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-[10px] font-mono whitespace-nowrap transition-colors"
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
