import { describe, it, expect, beforeEach } from "vitest";
import { encrypt, decrypt } from "./crypto";

describe("Crypto Module (AES-256-GCM)", () => {
  const validHexKey =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = validHexKey;
  });

  it("should encrypt and decrypt plaintext accurately", () => {
    const original = "my-secret-password-123!@#";
    const encrypted = encrypt(original);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(encrypted.authTag).toHaveLength(32); // 16 bytes = 32 hex chars

    const decrypted = decrypt(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.authTag
    );
    expect(decrypted).toBe(original);
  });

  it("should generate a unique IV for each encryption of the same plaintext", () => {
    const plaintext = "identical-password";
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);

    expect(decrypt(enc1.ciphertext, enc1.iv, enc1.authTag)).toBe(plaintext);
    expect(decrypt(enc2.ciphertext, enc2.iv, enc2.authTag)).toBe(plaintext);
  });

  it("should fail to decrypt if ciphertext is tampered", () => {
    const encrypted = encrypt("secure-credential");
    const tamperedCiphertext =
      encrypted.ciphertext.slice(0, -2) +
      (encrypted.ciphertext.slice(-2) === "aa" ? "bb" : "aa");

    expect(() =>
      decrypt(tamperedCiphertext, encrypted.iv, encrypted.authTag)
    ).toThrow();
  });

  it("should fail to decrypt if authTag is tampered", () => {
    const encrypted = encrypt("secure-credential");
    const tamperedTag =
      encrypted.authTag.slice(0, -2) +
      (encrypted.authTag.slice(-2) === "aa" ? "bb" : "aa");

    expect(() =>
      decrypt(encrypted.ciphertext, encrypted.iv, tamperedTag)
    ).toThrow();
  });

  it("should fail if ENCRYPTION_KEY is missing or invalid length", () => {
    process.env.ENCRYPTION_KEY = "too-short";
    expect(() => encrypt("test")).toThrow(/ENCRYPTION_KEY/);

    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("test")).toThrow(/ENCRYPTION_KEY/);
  });
});
