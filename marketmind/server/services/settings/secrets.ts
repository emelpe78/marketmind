import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getDbPath } from "../../database/db";

const SECRET_PREFIX = "enc:v1:";
const SECRET_KEYS = new Set(["openrouter-api-key", "local-ai-api-key"]);

export function isSecretSettingKey(key: string): boolean {
  return SECRET_KEYS.has(key);
}

function settingsKeyPath(): string {
  return join(dirname(getDbPath()), ".settings-key");
}

function getEncryptionKey(): Buffer {
  const keyPath = settingsKeyPath();
  if (existsSync(keyPath)) {
    return readFileSync(keyPath);
  }
  mkdirSync(dirname(keyPath), { recursive: true });
  const key = randomBytes(32);
  writeFileSync(keyPath, key, { mode: 0o600 });
  return key;
}

export function encodeSecret(value: string): string {
  if (!value) return "";
  if (value.startsWith(SECRET_PREFIX)) return value;

  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${SECRET_PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decodeSecret(value: string): string {
  if (!value) return "";
  if (!value.startsWith(SECRET_PREFIX)) return value;

  const payload = value.slice(SECRET_PREFIX.length);
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) return "";

  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
