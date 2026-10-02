import { describe, it, expect, vi } from "vitest";
import { SimpleMemoryCache, safeCache } from "./cache";

describe("Cache Utilities", () => {
  describe("SimpleMemoryCache", () => {
    it("should store and retrieve data within TTL", () => {
      const cache = new SimpleMemoryCache();
      cache.set("key1", { data: 123 }, 10);
      expect(cache.get<{ data: number }>("key1")).toEqual({ data: 123 });
    });

    it("should return null after TTL expires", async () => {
      const cache = new SimpleMemoryCache();
      cache.set("expired_key", "value", 0.01); // 10ms
      await new Promise((r) => setTimeout(r, 20));
      expect(cache.get("expired_key")).toBeNull();
    });

    it("should delete items on demand", () => {
      const cache = new SimpleMemoryCache();
      cache.set("item", "abc", 60);
      cache.delete("item");
      expect(cache.get("item")).toBeNull();
    });

    it("should clear all items", () => {
      const cache = new SimpleMemoryCache();
      cache.set("k1", 1, 60);
      cache.set("k2", 2, 60);
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe("safeCache fallback", () => {
    it("should execute underlying function directly when outside Next.js request context", async () => {
      const mockFn = vi.fn().mockResolvedValue("result_from_db");
      const wrapped = safeCache(mockFn, ["test-key"]);

      const result = await wrapped();
      expect(result).toBe("result_from_db");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
