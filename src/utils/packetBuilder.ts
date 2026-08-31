import { ByteLength, Endianness, PacketTemplate } from '../types';
import { calculateChecksum } from './checksums';

/**
 * Parses a hex string into a Uint8Array, ignoring spaces, 0x prefixes, and punctuation
 */
export function parseHexString(hex: string): Uint8Array {
  if (!hex) return new Uint8Array(0);
  const clean = hex.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 0) return new Uint8Array(0);

  // If odd number of hex digits, pad with a leading 0
  const normalized = clean.length % 2 !== 0 ? '0' + clean : clean;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Formats a Uint8Array or number array into a clean spaced uppercase HEX string (e.g. "AA 55 01 FE")
 */
export function formatHex(data: Uint8Array | number[]): string {
  if (!data || data.length === 0) return '';
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/**
 * Converts Uint8Array to ASCII string with non-printable characters escaped
 */
export function bytesToAscii(data: Uint8Array): string {
  let res = '';
  for (let i = 0; i < data.length; i++) {
    const code = data[i];
    if (code >= 32 && code <= 126) {
      res += String.fromCharCode(code);
    } else if (code === 10) {
      res += '\\n';
    } else if (code === 13) {
      res += '\\r';
    } else if (code === 9) {
      res += '\\t';
    } else {
      res += `\\x${code.toString(16).padStart(2, '0').toUpperCase()}`;
    }
  }
  return res;
}

/**
 * Converts a number to bytes of given length and endianness
 */
export function numberToBytes(num: number, length: ByteLength, endianness: Endianness): Uint8Array {
  const bytes = new Uint8Array(length);
  const bigInt = BigInt(Math.max(0, Math.floor(num)));

  if (endianness === 'big') {
    for (let i = length - 1; i >= 0; i--) {
      const shift = BigInt((length - 1 - i) * 8);
      bytes[i] = Number((bigInt >> shift) & 0xffn);
    }
  } else {
    for (let i = 0; i < length; i++) {
      const shift = BigInt(i * 8);
      bytes[i] = Number((bigInt >> shift) & 0xffn);
    }
  }
  return bytes;
}

/**
 * Builds a packet from template string matching the WPF implementation
 */
export function buildDynamicPacket(
  tmpl: string,
  num: number,
  mode: 'text' | 'hex' | 'script' | boolean
): {
  packetBytes: Uint8Array;
  packetHex: string;
  packetText: string;
} {
  const isHex = mode === true || mode === 'hex';
  const isScript = mode === 'script';

  if (isScript) {
    try {
       const scriptFn = new Function('num', 'tmpl', 'parseHexString', 'formatHex', 'bytesToAscii', `
          ${tmpl}
          if (typeof generatePacket === "function") {
              return generatePacket(num);
          }
          return new Uint8Array(0);
       `);
       
       const result = scriptFn(num, tmpl, parseHexString, formatHex, bytesToAscii);
       
       if (result instanceof Uint8Array) {
           return {
             packetBytes: result,
             packetHex: formatHex(result),
             packetText: bytesToAscii(result)
           };
       } else if (Array.isArray(result)) {
           const uint8 = new Uint8Array(result);
           return {
             packetBytes: uint8,
             packetHex: formatHex(uint8),
             packetText: bytesToAscii(uint8)
           };
       } else if (typeof result === 'string') {
          // treat as ASCII
           const bytes: number[] = [];
          for (let i = 0; i < result.length; i++) {
            bytes.push(result.charCodeAt(i) & 0xff);
          }
          const uint8 = new Uint8Array(bytes);
          return {
            packetBytes: uint8,
            packetHex: formatHex(uint8),
            packetText: bytesToAscii(uint8),
          };
       }
       return {
            packetBytes: new Uint8Array(0),
            packetHex: "",
            packetText: ""
       }
    } catch (e: any) {
      // Return a graceful error so we don't crash the UI or trigger unhandled error overlays
      return {
        packetBytes: new Uint8Array(0),
        packetHex: e.message || "SYNTAX ERROR",
        packetText: "ERROR"
      }
    }
  } else if (isHex) {
    const numHex2 = (num & 0xff).toString(16).padStart(2, '0').toUpperCase();
    const numHex4 = (num & 0xffff).toString(16).padStart(4, '0').toUpperCase();
    const numDec4 = (num % 10000).toString().padStart(4, '0');

    const proc = tmpl
      .replace(/{NUM}/g, numHex2)
      .replace(/{HEX:2}/g, numHex2)
      .replace(/{HEX:4}/g, numHex4)
      .replace(/{DEC:4}/g, numDec4);

    const parts = proc.split(/[\s,\-\\x]+/g).filter(Boolean);
    const bytes: number[] = [];
    for (const part of parts) {
      const val = parseInt(part, 16);
      if (!isNaN(val)) {
        bytes.push(val & 0xff);
      }
    }
    const uint8 = new Uint8Array(bytes);
    return {
      packetBytes: uint8,
      packetHex: formatHex(uint8),
      packetText: bytesToAscii(uint8),
    };
  } else {
    const numHex2 = (num & 0xff).toString(16).padStart(2, '0').toUpperCase();
    const numHex4 = (num & 0xffff).toString(16).padStart(4, '0').toUpperCase();
    const numDec4 = (num % 10000).toString().padStart(4, '0');

    let proc = tmpl
      .replace(/{NUM}/g, num.toString())
      .replace(/{DEC:4}/g, numDec4)
      .replace(/{HEX:2}/g, numHex2)
      .replace(/{HEX:4}/g, numHex4)
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n')
      .replace(/\\0/g, '\0')
      .replace(/\\t/g, '\t');

    // Convert string to bytes
    const bytes: number[] = [];
    for (let i = 0; i < proc.length; i++) {
      bytes.push(proc.charCodeAt(i) & 0xff);
    }
    const uint8 = new Uint8Array(bytes);
    return {
      packetBytes: uint8,
      packetHex: formatHex(uint8),
      packetText: bytesToAscii(uint8),
    };
  }
}

