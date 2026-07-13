type ZipFile = {
  filename: string;
  data: ArrayBuffer;
};

const ZIP_UTF8_FLAG = 0x0800;
let crc32Table: Uint32Array | null = null;

function getCrc32Table() {
  if (crc32Table) return crc32Table;

  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  crc32Table = table;
  return table;
}

function crc32(data: Uint8Array) {
  const table = getCrc32Table();
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = table[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

export function createZipBlob(files: ZipFile[], modifiedAt = new Date()) {
  const encoder = new TextEncoder();
  const timestamp = dosDateTime(modifiedAt);
  const chunks: BlobPart[] = [];
  const directory: BlobPart[] = [];
  let offset = 0;
  let directorySize = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.filename);
    const bytes = new Uint8Array(file.data);
    const checksum = crc32(bytes);
    const localHeader = new ArrayBuffer(30);
    const local = new DataView(localHeader);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, ZIP_UTF8_FLAG, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, timestamp.time, true);
    local.setUint16(12, timestamp.date, true);
    local.setUint32(14, checksum, true);
    local.setUint32(18, bytes.byteLength, true);
    local.setUint32(22, bytes.byteLength, true);
    local.setUint16(26, name.byteLength, true);
    chunks.push(localHeader, name, file.data);

    const centralHeader = new ArrayBuffer(46);
    const central = new DataView(centralHeader);
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, ZIP_UTF8_FLAG, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, timestamp.time, true);
    central.setUint16(14, timestamp.date, true);
    central.setUint32(16, checksum, true);
    central.setUint32(20, bytes.byteLength, true);
    central.setUint32(24, bytes.byteLength, true);
    central.setUint16(28, name.byteLength, true);
    central.setUint32(42, offset, true);
    directory.push(centralHeader, name);

    offset += localHeader.byteLength + name.byteLength + bytes.byteLength;
    directorySize += centralHeader.byteLength + name.byteLength;
  });

  chunks.push(...directory);
  const end = new ArrayBuffer(22);
  const endView = new DataView(end);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, directorySize, true);
  endView.setUint32(16, offset, true);
  chunks.push(end);

  return new Blob(chunks, { type: "application/zip" });
}
