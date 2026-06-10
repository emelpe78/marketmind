import { isAbsolute, resolve } from "node:path";

export function isDockerRuntime(): boolean {
  return process.env.MM_RUNTIME === "docker";
}

export function getEnvDatabasePath(): string | undefined {
  const key = isDockerRuntime() ? "MM_DATABASE_DOCKER" : "MM_DATABASE_DEV";
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function getRuntimeDefaultPath(): string {
  return getEnvDatabasePath() || "data/marketmind.db";
}

export function resolveDbPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return resolve(process.cwd(), "data/marketmind.db");
  }
  if (trimmed.startsWith("~/")) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return resolve(home, trimmed.slice(2));
  }
  if (isAbsolute(trimmed)) {
    return trimmed;
  }
  return resolve(process.cwd(), trimmed);
}

export function getActivePath(): string {
  const envPath = getEnvDatabasePath();
  if (envPath) {
    return resolveDbPath(envPath);
  }
  return resolveDbPath("data/marketmind.db");
}
