import type Database from "better-sqlite3";
import { isDockerRuntime } from "../../database/paths";
import { getAllSettings } from "../../database/settings";
import { AiNotConfiguredError } from "../errors";

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

const LOCALHOST_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

/** Im Docker-Container localhost → Host (LM Studio, Ollama auf dem Rechner). */
export function resolveLocalAiHostForRuntime(hostname: string): string {
  const override = process.env.MM_LOCAL_AI_HOST?.trim();
  if (override) return override;
  if (LOCALHOST_HOSTNAMES.has(hostname)) {
    return "host.docker.internal";
  }
  return hostname;
}

export function resolveLocalAiBaseUrl(url: string): string {
  const normalized = normalizeAiBaseUrl(url);
  if (!isDockerRuntime()) return normalized;

  try {
    const parsed = new URL(normalized);
    const resolvedHost = resolveLocalAiHostForRuntime(parsed.hostname);
    if (resolvedHost === parsed.hostname) return normalized;
    parsed.hostname = resolvedHost;
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return normalized;
  }
}

export function getAiConfig(db: Database.Database): AiConfig {
  const settings = getAllSettings(db);
  const provider: AiProvider =
    settings["ai-provider"] === "local" ? "local" : "openrouter";

  if (provider === "local") {
    return {
      provider: "local",
      apiKey: settings["local-ai-api-key"] || "",
      baseUrl: resolveLocalAiBaseUrl(
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
    throw new AiNotConfiguredError("OpenRouter API-Key nicht konfiguriert");
  }
  if (config.provider === "local" && !config.defaultModel.trim()) {
    throw new AiNotConfiguredError("Lokales Modell nicht konfiguriert");
  }
  if (config.provider === "local" && !config.baseUrl.trim()) {
    throw new AiNotConfiguredError("OpenAI API URL nicht konfiguriert");
  }
}
