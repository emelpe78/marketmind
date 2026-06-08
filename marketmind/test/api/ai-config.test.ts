import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  getAiConfig,
  isAiConfigured,
  normalizeAiBaseUrl,
} from "../../server/services/ai/config";
import { setSetting } from "../../server/database/seed";

describe("ai config", () => {
  it("reads openrouter settings from database", () => {
    createTestDb();
    const db = getDb();
    setSetting(db, "ai-provider", "openrouter");
    setSetting(db, "openrouter-api-key", "sk-test");
    setSetting(db, "default-model", "deepseek/deepseek-v4-pro");

    const config = getAiConfig(db);
    expect(config.provider).toBe("openrouter");
    expect(config.apiKey).toBe("sk-test");
    expect(config.defaultModel).toBe("deepseek/deepseek-v4-pro");
    expect(isAiConfigured(config)).toBe(true);
  });

  it("reads local ai settings from database", () => {
    createTestDb();
    const db = getDb();
    setSetting(db, "ai-provider", "local");
    setSetting(db, "local-ai-api-url", "http://127.0.0.1:1234");
    setSetting(db, "local-ai-model", "llama3.2");

    const config = getAiConfig(db);
    expect(config.provider).toBe("local");
    expect(config.baseUrl).toBe("http://127.0.0.1:1234/v1");
    expect(config.defaultModel).toBe("llama3.2");
    expect(isAiConfigured(config)).toBe(true);
  });

  it("normalizes local api base urls", () => {
    expect(normalizeAiBaseUrl("http://localhost:11434")).toBe(
      "http://localhost:11434/v1",
    );
  });
});
