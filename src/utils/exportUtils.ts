import { LogEntry } from '../types';

export function exportLogsToCsv(logs: LogEntry[]) {
  const rows = [
    ['Timestamp', 'Type', 'HEX', 'ASCII'].join(',')
  ];
  
  logs.forEach(log => {
    // Escape quotes in text
    const escapedText = log.text.replace(/"/g, '""');
    rows.push(`"${log.timestamp}","${log.type.toUpperCase()}","${log.hex}","${escapedText}"`);
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `serial_dump_${new Date().getTime()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLogsToPcap(logs: LogEntry[]) {
  // Global Header (24 bytes)
  const globalHeader = new Uint8Array(24);
  const dvGlobal = new DataView(globalHeader.buffer);
  dvGlobal.setUint32(0, 0xa1b2c3d4, true); // Magic Number
  dvGlobal.setUint16(4, 2, true); // Major Version
  dvGlobal.setUint16(6, 4, true); // Minor Version
  dvGlobal.setUint32(8, 0, true); // GMT to local
  dvGlobal.setUint32(12, 0, true); // Accuracy of timestamps
  dvGlobal.setUint32(16, 65535, true); // Max length of captured packets
  dvGlobal.setUint32(20, 147, true); // Data Link Type: 147 (USER0)

  const packetBuffers: Uint8Array[] = [];
  packetBuffers.push(globalHeader);

  logs.forEach(log => {
    if (log.type !== 'tx' && log.type !== 'rx') return;

    const hexStr = log.hex.replace(/\s+/g, '');
    const dataLen = hexStr.length / 2;
    const payload = new Uint8Array(dataLen + 1);

    // Direction flag (custom convention for USER0): 0x00 for RX, 0x01 for TX
    payload[0] = log.type === 'tx' ? 0x01 : 0x00;

    for (let i = 0; i < dataLen; i++) {
      payload[i + 1] = parseInt(hexStr.substr(i * 2, 2), 16);
    }

    const packetHeader = new Uint8Array(16);
    const dvPacket = new DataView(packetHeader.buffer);
    
    // Parse our timestamp string if possible, fallback to now
    const now = new Date();
    const timeParts = log.timestamp.split(':');
    if (timeParts.length === 3) {
      const secParts = timeParts[2].split('.');
      now.setHours(parseInt(timeParts[0], 10));
      now.setMinutes(parseInt(timeParts[1], 10));
      now.setSeconds(parseInt(secParts[0], 10));
      const ms = parseInt(secParts[1] || '0', 10);
      dvPacket.setUint32(0, Math.floor(now.getTime() / 1000), true);
      dvPacket.setUint32(4, ms * 1000, true);
    } else {
      dvPacket.setUint32(0, Math.floor(Date.now() / 1000), true);
      dvPacket.setUint32(4, 0, true);
    }

    dvPacket.setUint32(8, payload.length, true); // incl_len
    dvPacket.setUint32(12, payload.length, true); // orig_len

    packetBuffers.push(packetHeader);
    packetBuffers.push(payload);
  });

  const totalLength = packetBuffers.reduce((acc, val) => acc + val.length, 0);
  const resultBuffer = new Uint8Array(totalLength);
  let offset = 0;
  packetBuffers.forEach(buf => {
    resultBuffer.set(buf, offset);
    offset += buf.length;
  });

  const blob = new Blob([resultBuffer], { type: 'application/vnd.tcpdump.pcap' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `serial_dump_${new Date().getTime()}.pcap`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
