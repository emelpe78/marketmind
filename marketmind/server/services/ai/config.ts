import type Database from "better-sqlite3";
import { getAllSettings } from "../../database/seed";

export type AiProvider = "openrouter" | "local";

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

export interface AiConnection {
  apiKey: string;
  baseUrl: string;
}

export function normalizeAiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return "http://127.0.0.1:11434/v1";
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

export function getAiConfig(db: Database.Database): AiConfig {
  const settings = getAllSettings(db);
  const provider: AiProvider =
    settings["ai-provider"] === "local" ? "local" : "openrouter";

  if (provider === "local") {
    return {
      provider: "local",
      apiKey: settings["local-ai-api-key"] || "",
      baseUrl: normalizeAiBaseUrl(
        settings["local-ai-api-url"] || "http://127.0.0.1:11434/v1",
      ),
      defaultModel: settings["local-ai-model"] || "",
    };
  }

  return {
    provider: "openrouter",
    apiKey: settings["openrouter-api-key"] || "",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: settings["default-model"] || "deepseek/deepseek-v4-pro",
  };
}

export function getAiConnection(config: AiConfig): AiConnection {
  return {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  };
}

export function isAiConfigured(config: AiConfig): boolean {
  if (config.provider === "openrouter") {
    return !!config.apiKey.trim();
  }
  return !!config.defaultModel.trim() && !!config.baseUrl.trim();
}

export function assertAiConfigured(config: AiConfig): void {
  if (config.provider === "openrouter" && !config.apiKey.trim()) {
    throw createError({
      statusCode: 400,
      message: "OpenRouter API-Key nicht konfiguriert",
    });
  }
  if (config.provider === "local" && !config.defaultModel.trim()) {
    throw createError({
      statusCode: 400,
      message: "Lokales Modell nicht konfiguriert",
    });
  }
  if (config.provider === "local" && !config.baseUrl.trim()) {
    throw createError({
      statusCode: 400,
      message: "OpenAI API URL nicht konfiguriert",
    });
  }
}
