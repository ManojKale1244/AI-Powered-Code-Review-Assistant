import * as crypto from 'crypto';

/**
 * Utility to encrypt/decrypt AI provider API keys at rest.
 *
 * Uses AES-256-GCM (authenticated encryption) — provides both
 * confidentiality and integrity. The IV is prepended to the ciphertext
 * and the auth tag is appended.
 *
 * Format: [IV (12 bytes)][ciphertext][auth tag (16 bytes)]
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encrypt(text: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Combine IV + ciphertext + tag
  return iv.toString('hex') + encrypted + tag.toString('hex');
}

export function decrypt(encryptedText: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');

  // Extract IV, ciphertext, and auth tag
  const iv = Buffer.from(encryptedText.slice(0, IV_LENGTH * 2), 'hex');
  const tag = Buffer.from(
    encryptedText.slice(encryptedText.length - TAG_LENGTH * 2),
    'hex',
  );
  const ciphertext = encryptedText.slice(
    IV_LENGTH * 2,
    encryptedText.length - TAG_LENGTH * 2,
  );

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
