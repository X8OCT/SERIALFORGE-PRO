export type ProtocolType = 'none' | 'modbus' | 'can' | 'nmea';

export function parseProtocol(type: ProtocolType, hex: string, text: string): string | null {
  if (type === 'none') return null;

  try {
    if (type === 'modbus') {
      // Modbus RTU simple parser
      // e.g. "0A 03 00 00 00 01 85 70"
      const bytes = hex.trim().split(' ').filter(b => b.length > 0).map(b => parseInt(b, 16));
      if (bytes.length < 4) return `[MODBUS INCOMPLETE] ${hex}`;
      
      const id = bytes[0];
      const cmd = bytes[1];
      
      let cmdName = `CMD: 0x${cmd.toString(16).toUpperCase()}`;
      if (cmd === 0x01) cmdName = 'READ COILS (01)';
      if (cmd === 0x02) cmdName = 'READ DISCRETE (02)';
      if (cmd === 0x03) cmdName = 'READ HOLDING (03)';
      if (cmd === 0x04) cmdName = 'READ INPUT (04)';
      if (cmd === 0x05) cmdName = 'WRITE SINGLE COIL (05)';
      if (cmd === 0x06) cmdName = 'WRITE SINGLE REG (06)';
      if (cmd === 0x0F) cmdName = 'WRITE MULTI COILS (0F)';
      if (cmd === 0x10) cmdName = 'WRITE MULTI REGS (10)';
      
      // We could parse data, but let's keep it simple
      const dataLen = bytes.length - 4; // Minus ID, CMD, CRC(2)
      return `[MODBUS ID: ${id}] [${cmdName}] [DATA: ${dataLen}B] [CRC: ${bytes[bytes.length-2].toString(16).padStart(2, '0').toUpperCase()} ${bytes[bytes.length-1].toString(16).padStart(2, '0').toUpperCase()}]`;
    }

    if (type === 'can') {
      // Very basic CAN parser, assuming Hex format like "ID_H ID_L DLC D0 D1..."
      const bytes = hex.trim().split(' ').filter(b => b.length > 0).map(b => parseInt(b, 16));
      if (bytes.length < 2) return `[CAN INCOMPLETE] ${hex}`;
      
      // For a serial CAN bridge, usually [ID1, ID2, DLC, Data...]
      if (bytes.length >= 3) {
        const id = (bytes[0] << 8) | bytes[1];
        const dlc = bytes[2];
        const data = bytes.slice(3, 3 + dlc).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
        return `[CAN ID: 0x${id.toString(16).toUpperCase().padStart(3, '0')}] [DLC: ${dlc}] [DATA: ${data}]`;
      }
      return `[CAN RAW] [BYTES: ${bytes.length}]`;
    }

    if (type === 'nmea') {
      // NMEA is text based, e.g. "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47"
      if (!text || !text.startsWith('$')) return `[NMEA RAW] ${text}`;
      
      const parts = text.split(',');
      const msgType = parts[0].substring(1); // e.g. GPGGA
      
      let summary = `[NMEA: ${msgType}]`;
      if (msgType === 'GPGGA' && parts.length > 5) {
        summary += ` [TIME: ${parts[1]}] [LAT: ${parts[2]} ${parts[3]}] [LON: ${parts[4]} ${parts[5]}]`;
      } else if (msgType === 'GPRMC' && parts.length > 5) {
        summary += ` [STATUS: ${parts[2]}] [LAT: ${parts[3]} ${parts[4]}] [LON: ${parts[5]} ${parts[6]}]`;
      } else if (msgType === 'GPGSV') {
        summary += ` [SATS IN VIEW: ${parts[3]}]`;
      } else {
        summary += ` [PARAMS: ${parts.length - 1}]`;
      }
      return summary;
    }
  } catch (e) {
    return null;
  }
  
  return null;
}
