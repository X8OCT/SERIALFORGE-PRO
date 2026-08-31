import { ChecksumType, Endianness } from '../types';

export function calculateChecksum(
  data: Uint8Array,
  type: ChecksumType,
  endianness: Endianness = 'big'
): Uint8Array {
  switch (type) {
    case 'none':
      return new Uint8Array(0);

    case 'crc8': {
      // Standard CRC-8: Poly 0x07, Init 0x00
      let crc = 0x00;
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x80) !== 0) {
            crc = ((crc << 1) ^ 0x07) & 0xff;
          } else {
            crc = (crc << 1) & 0xff;
          }
        }
      }
      return new Uint8Array([crc]);
    }

    case 'crc8_maxim': {
      // 1-Wire / Maxim CRC-8: Poly 0x8C (reflected 0x31), Init 0x00
      let crc = 0x00;
      for (let i = 0; i < data.length; i++) {
        let byte = data[i];
        for (let j = 0; j < 8; j++) {
          const mix = (crc ^ byte) & 0x01;
          crc >>= 1;
          if (mix) {
            crc ^= 0x8c;
          }
          byte >>= 1;
        }
      }
      return new Uint8Array([crc & 0xff]);
    }

    case 'crc16_modbus': {
      // Modbus RTU CRC-16: Poly 0xA001 (reflected 0x8005), Init 0xFFFF
      let crc = 0xffff;
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x0001) !== 0) {
            crc = (crc >> 1) ^ 0xa001;
          } else {
            crc = crc >> 1;
          }
        }
      }
      const high = (crc >> 8) & 0xff;
      const low = crc & 0xff;
      // In Modbus standard, low byte is sent first (little-endian) by default
      return endianness === 'big'
        ? new Uint8Array([high, low])
        : new Uint8Array([low, high]);
    }

    case 'crc16_ccitt': {
      // CRC-16 CCITT (X.25 / Kermit variant Poly 0x1021, Init 0xFFFF)
      let crc = 0xffff;
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i] << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = ((crc << 1) ^ 0x1021) & 0xffff;
          } else {
            crc = (crc << 1) & 0xffff;
          }
        }
      }
      const high = (crc >> 8) & 0xff;
      const low = crc & 0xff;
      return endianness === 'big'
        ? new Uint8Array([high, low])
        : new Uint8Array([low, high]);
    }

    case 'crc16_xmodem': {
      // CRC-16 XMODEM: Poly 0x1021, Init 0x0000
      let crc = 0x0000;
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i] << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = ((crc << 1) ^ 0x1021) & 0xffff;
          } else {
            crc = (crc << 1) & 0xffff;
          }
        }
      }
      const high = (crc >> 8) & 0xff;
      const low = crc & 0xff;
      return endianness === 'big'
        ? new Uint8Array([high, low])
        : new Uint8Array([low, high]);
    }

    case 'crc32': {
      // Standard Ethernet / ZIP CRC-32
      let crc = 0xffffffff;
      for (let i = 0; i < data.length; i++) {
        let byte = data[i];
        crc ^= byte;
        for (let j = 0; j < 8; j++) {
          const mask = -(crc & 1);
          crc = (crc >>> 1) ^ (0xedb88320 & mask);
        }
      }
      crc = (crc ^ 0xffffffff) >>> 0;
      const b0 = (crc >> 24) & 0xff;
      const b1 = (crc >> 16) & 0xff;
      const b2 = (crc >> 8) & 0xff;
      const b3 = crc & 0xff;
      return endianness === 'big'
        ? new Uint8Array([b0, b1, b2, b3])
        : new Uint8Array([b3, b2, b1, b0]);
    }

    case 'sum8': {
      // 8-bit sum modulo 256
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum = (sum + data[i]) & 0xff;
      }
      return new Uint8Array([sum]);
    }

    case 'sum8_2s_complement': {
      // 8-bit 2's complement ((-sum) & 0xFF) - common in Intel HEX / protocols
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum = (sum + data[i]) & 0xff;
      }
      return new Uint8Array([(-sum) & 0xff]);
    }

    case 'sum16': {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum = (sum + data[i]) & 0xffff;
      }
      const high = (sum >> 8) & 0xff;
      const low = sum & 0xff;
      return endianness === 'big'
        ? new Uint8Array([high, low])
        : new Uint8Array([low, high]);
    }

    case 'xor8':
    case 'lrc': {
      // Longitudinal Redundancy Check / XOR of all bytes (NMEA, Modbus ASCII)
      let xor = 0;
      for (let i = 0; i < data.length; i++) {
        xor ^= data[i];
      }
      return new Uint8Array([xor & 0xff]);
    }

    default:
      return new Uint8Array(0);
  }
}
