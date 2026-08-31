import { HardwareSimulatorConfig, SerialPortConfig } from '../types';
import { formatHex, parseHexString } from './packetBuilder';

export interface SerialCallbacks {
  onReceive: (data: Uint8Array, hex: string, text: string) => void;
  onError: (err: Error | string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export class SerialManager {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private keepReading = false;
  private callbacks: SerialCallbacks;
  private isSimulated = false;
  private simConfig: HardwareSimulatorConfig | null = null;

  constructor(callbacks: SerialCallbacks) {
    this.callbacks = callbacks;
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public isConnected(): boolean {
    return this.isSimulated || this.port !== null;
  }

  public getIsSimulated(): boolean {
    return this.isSimulated;
  }

  public setSimulatorConfig(config: HardwareSimulatorConfig) {
    this.simConfig = config;
  }

  /**
   * Connect to a simulated virtual hardware COM port for offline testing & rapid brute-force demo
   */
  public async connectSimulator(config: HardwareSimulatorConfig): Promise<void> {
    if (this.isConnected()) {
      await this.disconnect();
    }
    this.isSimulated = true;
    this.simConfig = config;
    this.callbacks.onConnect();
  }

  /**
   * Connect to real physical hardware via Web Serial API
   */
  public async connectHardware(portConfig: SerialPortConfig): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API не поддерживается вашим браузером. Используйте Chrome/Edge/Opera или встроенный симулятор.');
    }

    if (this.isConnected()) {
      await this.disconnect();
    }

    try {
      // Request a port and open it
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({
        baudRate: portConfig.baudRate,
        dataBits: portConfig.dataBits,
        stopBits: portConfig.stopBits,
        parity: portConfig.parity,
        flowControl: portConfig.flowControl,
        bufferSize: portConfig.bufferSize || 4096,
      });

      this.isSimulated = false;
      this.keepReading = true;
      this.callbacks.onConnect();
      this.startReadLoop();
    } catch (err: any) {
      this.port = null;
      throw err;
    }
  }

  /**
   * Continuous background read loop from physical serial port
   */
  private async startReadLoop(): Promise<void> {
    while (this.port && this.port.readable && this.keepReading) {
      try {
        this.reader = this.port.readable.getReader();
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          if (value && value.length > 0) {
            const hex = formatHex(value);
            const text = new TextDecoder('utf-8', { fatal: false }).decode(value);
            this.callbacks.onReceive(value, hex, text);
          }
        }
      } catch (err: any) {
        if (this.keepReading) {
          this.callbacks.onError(err);
        }
      } finally {
        if (this.reader) {
          try {
            this.reader.releaseLock();
          } catch {
            // Ignore release lock error
          }
          this.reader = null;
        }
      }
    }
  }

  /**
   * Send data bytes over serial (or simulator)
   */
  public async send(data: Uint8Array): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Порт не подключен.');
    }

    if (this.isSimulated) {
      this.handleSimulatorResponse(data);
      return;
    }

    if (!this.port || !this.port.writable) {
      throw new Error('Порт недоступен для записи.');
    }

    const writer = this.port.writable.getWriter();
    try {
      await writer.write(data);
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Handles virtual hardware replies and simulated authentication responses
   */
  private handleSimulatorResponse(sentBytes: Uint8Array): void {
    if (!this.simConfig) return;

    const delay = Math.max(2, this.simConfig.responseDelayMs);

    setTimeout(() => {
      if (!this.isSimulated) return;

      const secret = this.simConfig!.secretCode;
      const sentHex = formatHex(sentBytes);

      // Check if sent packet contains secret code in hex or ascii
      const secretHex2 = secret.toString(16).padStart(2, '0').toUpperCase();
      const secretHex4 = secret.toString(16).padStart(4, '0').toUpperCase();
      const secretHex8 = secret.toString(16).padStart(8, '0').toUpperCase();
      const secretStr = String(secret);

      const isExactMatch =
        sentHex.includes(secretHex4.substr(0, 2) + ' ' + secretHex4.substr(2, 2)) ||
        sentHex.includes(secretHex2) ||
        sentHex.includes(secretHex8) ||
        sentHex.replace(/\s+/g, '').includes(secretHex4) ||
        new TextDecoder().decode(sentBytes).includes(secretStr);

      let replyBytes: Uint8Array;
      if (isExactMatch) {
        // Success response from target hardware
        if (this.simConfig!.packetStructure === 'binary_custom' || sentHex.startsWith('AA 55') || sentHex.startsWith('01 06')) {
          replyBytes = new Uint8Array([0x55, 0xAA, (secret >> 8) & 0xff, secret & 0xff, 0x00, 0x00]);
        } else {
          const replyText = `ACCESS_GRANTED:OK:${secret}\r\n`;
          replyBytes = new TextEncoder().encode(replyText);
        }
      } else {
        // Standard rejection / error response or ACK/NACK
        if (this.simConfig!.packetStructure === 'modbus') {
          // Modbus exception 0x83 0x02
          replyBytes = new Uint8Array([0x01, 0x83, 0x02, 0xc0, 0xf1]);
        } else if (this.simConfig!.packetStructure === 'nmea') {
          replyBytes = new TextEncoder().encode(`$ERR,INVALID_PIN*1C\r\n`);
        } else {
          // Default NACK 0x15 or "ERR\r\n"
          replyBytes = new Uint8Array([0x15, 0x00, 0xff]);
        }
      }

      this.callbacks.onReceive(
        replyBytes,
        formatHex(replyBytes),
        new TextDecoder('utf-8', { fatal: false }).decode(replyBytes)
      );
    }, delay);
  }

  /**
   * Disconnect port cleanly
   */
  public async disconnect(): Promise<void> {
    this.keepReading = false;
    this.isSimulated = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {}
      try {
        this.reader.releaseLock();
      } catch {}
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch {}
      this.port = null;
    }

    this.callbacks.onDisconnect();
  }
}
