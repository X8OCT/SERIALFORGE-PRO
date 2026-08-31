export type AppLanguage = 'ru' | 'ua' | 'en';

export type Endianness = 'big' | 'little';
export type ByteLength = 1 | 2 | 3 | 4 | 8;
export type ChecksumType =
  | 'none'
  | 'crc8'
  | 'crc8_maxim'
  | 'crc16_modbus'
  | 'crc16_ccitt'
  | 'crc16_xmodem'
  | 'crc32'
  | 'sum8'
  | 'sum8_2s_complement'
  | 'sum16'
  | 'xor8'
  | 'lrc';

export interface PacketTemplate {
  headerHex: string; // e.g. "AA 55"
  footerHex: string; // e.g. "0D 0A"
  sequenceByteLength: ByteLength;
  sequenceEndianness: Endianness;
  checksumType: ChecksumType;
  checksumEndianness: Endianness;
  addChecksum: boolean;
  prefixDataHex: string; // Static data between header and sequence
  suffixDataHex: string; // Static data between sequence and checksum
}

export interface SerialPortConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
  bufferSize: number;
}

export type MatchMode = 'contains' | 'exact_hex' | 'regex' | 'any' | 'script';

export type PayloadMode = 'text' | 'hex' | 'script';

export interface SequencerConfig {
  startNumber: number;
  endNumber: number;
  step: number;
  delayMs: number;
  timeoutMs: number;
  stopOnMatch: boolean;
  matchPatternHex: string;
  matchPatternText: string;
  matchMode: MatchMode;
  retryCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'tx' | 'rx' | 'info' | 'error' | 'match' | 'system';
  hex: string;
  text: string;
  seqNumber?: number;
  latencyMs?: number;
}

export interface HitResult {
  id: string;
  time: string;
  keyNum: number;
  keyHex: string;
  sent: string;
  response: string;
  latencyMs?: number;
}

export interface PresetProfile {
  id: string;
  nameRu: string;
  nameUa: string;
  nameEn: string;
  isHexMode: boolean; // deprecated, use payloadMode instead
  payloadMode?: PayloadMode;
  template: string;
  startNum: number;
  endNum: number;
  step: number;
  delayMs: number;
  stopPattern: string;
  matchMode: MatchMode;
  baudRate: number;
}

export interface HardwareSimulatorConfig {
  enabled: boolean;
  secretCode: number;
  responseDelayMs: number;
  stopPattern?: string;
  packetStructure?: 'binary_custom' | 'modbus' | 'nmea' | string;
}

export interface AppSavedState {
  language: AppLanguage;
  baudRate: number;
  selectedPresetIndex: number;
  isHexMode: boolean; // deprecated, use payloadMode instead
  payloadMode?: PayloadMode;
  template: string;
  startNum: number;
  endNum: number;
  step: number;
  delayMs: number;
  stopOnMatch: boolean;
  matchMode: MatchMode;
  stopPattern: string;
  autoScroll: boolean;
  lastSavedKeyNum: number;
}
