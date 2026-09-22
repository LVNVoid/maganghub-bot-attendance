import { describe, it, expect } from "vitest";
import { isSafeUrl } from "./url-utils";

describe("isSafeUrl SSRF Prevention", () => {
  it("allows valid public URLs", () => {
    expect(isSafeUrl("https://api.groq.com/openai/v1")).toBe(true);
    expect(isSafeUrl("https://openrouter.ai/api/v1")).toBe(true);
    expect(isSafeUrl("http://43.157.204.138:20128/v1")).toBe(true);
  });

  it("blocks localhost and loopback addresses", () => {
    expect(isSafeUrl("http://localhost:3000/v1")).toBe(false);
    expect(isSafeUrl("http://127.0.0.1:8080")).toBe(false);
    expect(isSafeUrl("http://0.0.0.0:5432")).toBe(false);
    expect(isSafeUrl("http://[::1]:8000")).toBe(false);
  });

  it("blocks private network IP ranges", () => {
    expect(isSafeUrl("http://10.0.0.1:8000")).toBe(false);
    expect(isSafeUrl("http://172.16.0.5:8000")).toBe(false);
    expect(isSafeUrl("http://172.31.255.255:8000")).toBe(false);
    expect(isSafeUrl("http://192.168.1.1:8000")).toBe(false);
  });

  it("blocks AWS / cloud metadata endpoints", () => {
    expect(isSafeUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isSafeUrl("http://169.254.1.1")).toBe(false);
  });

  it("blocks internal/local domain names", () => {
    expect(isSafeUrl("http://service.internal/v1")).toBe(false);
    expect(isSafeUrl("http://router.lan")).toBe(false);
    expect(isSafeUrl("http://myhost.local")).toBe(false);
  });

  it("rejects non-http protocols", () => {
    expect(isSafeUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeUrl("gopher://127.0.0.1:70")).toBe(false);
    expect(isSafeUrl("ftp://example.com")).toBe(false);
  });
});
