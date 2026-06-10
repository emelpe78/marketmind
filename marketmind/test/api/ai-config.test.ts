import { afterEach, describe, expect, it } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  getAiConfig,
  isAiConfigured,
  normalizeAiBaseUrl,
  resolveLocalAiBaseUrl,
} from "../../server/services/ai/config";
import { setSetting } from "../../server/database/settings";

describe("ai config", () => {
  const originalRuntime = process.env.MM_RUNTIME;
  const originalLocalAiHost = process.env.MM_LOCAL_AI_HOST;

  afterEach(() => {
    if (originalRuntime === undefined) {
      delete process.env.MM_RUNTIME;
    } else {
      process.env.MM_RUNTIME = originalRuntime;
    }
    if (originalLocalAiHost === undefined) {
      delete process.env.MM_LOCAL_AI_HOST;
    } else {
      process.env.MM_LOCAL_AI_HOST = originalLocalAiHost;
    }
  });

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

  it("rewrites localhost to host.docker.internal in docker runtime", () => {
    process.env.MM_RUNTIME = "docker";
    expect(resolveLocalAiBaseUrl("http://127.0.0.1:3666")).toBe(
      "http://host.docker.internal:3666/v1",
    );
    expect(resolveLocalAiBaseUrl("http://localhost:11434/v1")).toBe(
      "http://host.docker.internal:11434/v1",
    );
  });

  it("keeps localhost in dev runtime", () => {
    delete process.env.MM_RUNTIME;
    expect(resolveLocalAiBaseUrl("http://127.0.0.1:3666")).toBe(
      "http://127.0.0.1:3666/v1",
    );
  });

  it("uses MM_LOCAL_AI_HOST override in docker runtime", () => {
    process.env.MM_RUNTIME = "docker";
    process.env.MM_LOCAL_AI_HOST = "192.168.1.10";
    expect(resolveLocalAiBaseUrl("http://127.0.0.1:3666")).toBe(
      "http://192.168.1.10:3666/v1",
    );
  });

  it("applies docker localhost rewrite when reading local ai config", () => {
    const dbPath = createTestDb();
    process.env.MM_RUNTIME = "docker";
    const db = getDb(dbPath);
    setSetting(db, "ai-provider", "local");
    setSetting(db, "local-ai-api-url", "http://127.0.0.1:3666");
    setSetting(db, "local-ai-model", "test-model");

    const config = getAiConfig(db);
    expect(config.baseUrl).toBe("http://host.docker.internal:3666/v1");
  });
});
