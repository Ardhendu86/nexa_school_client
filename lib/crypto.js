/**
 * URL-safe ID Encryption and Decryption Utility for Frontend
 */

const SECRET = 'nexaweb_school_secure_key_2026';

export function encryptId(id) {
  if (!id && id !== 0) return '';
  const strId = String(id);
  const saltVal = Math.floor(Math.random() * 0xffff);
  const salt = saltVal.toString(16).padStart(4, '0');

  let checksum = 0;
  for (let i = 0; i < strId.length; i++) {
    checksum = (checksum + strId.charCodeAt(i)) % 256;
  }
  const checksumHex = (checksum ^ (saltVal & 0xff)).toString(16).padStart(2, '0');

  let encrypted = '';
  for (let i = 0; i < strId.length; i++) {
    const charCode = strId.charCodeAt(i);
    const keyChar = SECRET.charCodeAt((i + saltVal) % SECRET.length);
    const enc = charCode ^ keyChar;
    encrypted += enc.toString(16).padStart(2, '0');
  }

  return `${salt}${checksumHex}${encrypted}`;
}

export function decryptId(hash) {
  if (!hash && hash !== 0) return '';
  const strHash = String(hash).trim();

  // If length < 8 or not valid hex, return as plain ID
  if (strHash.length < 8 || !/^[0-9a-fA-F]+$/.test(strHash)) {
    return strHash;
  }

  const saltHex = strHash.substring(0, 4);
  const saltVal = parseInt(saltHex, 16);
  if (isNaN(saltVal)) return strHash;

  const checksumHex = strHash.substring(4, 6);
  const expectedChecksumXor = parseInt(checksumHex, 16);
  if (isNaN(expectedChecksumXor)) return strHash;

  let decrypted = '';
  for (let i = 6; i < strHash.length; i += 2) {
    const byteHex = strHash.substring(i, i + 2);
    const byteVal = parseInt(byteHex, 16);
    if (isNaN(byteVal)) return strHash;
    const keyChar = SECRET.charCodeAt(((i - 6) / 2 + saltVal) % SECRET.length);
    decrypted += String.fromCharCode(byteVal ^ keyChar);
  }

  let actualChecksum = 0;
  for (let i = 0; i < decrypted.length; i++) {
    actualChecksum = (actualChecksum + decrypted.charCodeAt(i)) % 256;
  }

  if ((actualChecksum ^ (saltVal & 0xff)) === expectedChecksumXor) {
    return decrypted;
  }

  return strHash;
}
