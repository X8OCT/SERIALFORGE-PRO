using System;

namespace SerialForgeWpf
{
    public enum ChecksumAlgorithm
    {
        None,
        Crc16Modbus,
        Crc16Ccitt,
        Crc8,
        Sum8,
        Xor8
    }

    public static class ChecksumHelper
    {
        public static byte[] Calculate(byte[] data, ChecksumAlgorithm algorithm, bool isLittleEndian = true)
        {
            if (data == null || data.Length == 0) return Array.Empty<byte>();

            switch (algorithm)
            {
                case ChecksumAlgorithm.Crc16Modbus:
                    ushort crcModbus = 0xFFFF;
                    for (int i = 0; i < data.Length; i++)
                    {
                        crcModbus ^= (ushort)data[i];
                        for (int j = 0; j < 8; j++)
                        {
                            if ((crcModbus & 0x0001) != 0)
                            {
                                crcModbus >>= 1;
                                crcModbus ^= 0xA001;
                            }
                            else
                            {
                                crcModbus >>= 1;
                            }
                        }
                    }
                    return isLittleEndian
                        ? new byte[] { (byte)(crcModbus & 0xFF), (byte)((crcModbus >> 8) & 0xFF) }
                        : new byte[] { (byte)((crcModbus >> 8) & 0xFF), (byte)(crcModbus & 0xFF) };

                case ChecksumAlgorithm.Crc16Ccitt:
                    ushort crcCcitt = 0xFFFF;
                    for (int i = 0; i < data.Length; i++)
                    {
                        crcCcitt ^= (ushort)(data[i] << 8);
                        for (int j = 0; j < 8; j++)
                        {
                            if ((crcCcitt & 0x8000) != 0)
                            {
                                crcCcitt = (ushort)((crcCcitt << 1) ^ 0x1021);
                            }
                            else
                            {
                                crcCcitt <<= 1;
                            }
                        }
                    }
                    return isLittleEndian
                        ? new byte[] { (byte)(crcCcitt & 0xFF), (byte)((crcCcitt >> 8) & 0xFF) }
                        : new byte[] { (byte)((crcCcitt >> 8) & 0xFF), (byte)(crcCcitt & 0xFF) };

                case ChecksumAlgorithm.Crc8:
                    byte crc8 = 0x00;
                    for (int i = 0; i < data.Length; i++)
                    {
                        crc8 ^= data[i];
                        for (int j = 0; j < 8; j++)
                        {
                            if ((crc8 & 0x80) != 0)
                                crc8 = (byte)((crc8 << 1) ^ 0x07);
                            else
                                crc8 <<= 1;
                        }
                    }
                    return new byte[] { crc8 };

                case ChecksumAlgorithm.Sum8:
                    byte sum = 0;
                    for (int i = 0; i < data.Length; i++) sum += data[i];
                    return new byte[] { sum };

                case ChecksumAlgorithm.Xor8:
                    byte xor = 0;
                    for (int i = 0; i < data.Length; i++) xor ^= data[i];
                    return new byte[] { xor };

                default:
                    return Array.Empty<byte>();
            }
        }
    }
}
