import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

const DOCKER_DATA_DIR = "/app/data";

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

/** Host-Pfad aus MM_DATABASE_DOCKER → Container-Pfad unter dem Bind-Mount. */
export function mapDockerDatabasePath(resolvedPath: string): string {
  if (
    isAbsolute(resolvedPath) &&
    resolvedPath !== DOCKER_DATA_DIR &&
    !resolvedPath.startsWith(`${DOCKER_DATA_DIR}/`)
  ) {
    return join(DOCKER_DATA_DIR, basename(resolvedPath));
  }
  return resolvedPath;
}

export function resolveDbPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return resolve(process.cwd(), "data/marketmind.db");
  }
  if (trimmed.startsWith("~/")) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const resolved = resolve(home, trimmed.slice(2));
    return isDockerRuntime() ? mapDockerDatabasePath(resolved) : resolved;
  }
  const resolved = isAbsolute(trimmed)
    ? trimmed
    : resolve(process.cwd(), trimmed);
  return isDockerRuntime() ? mapDockerDatabasePath(resolved) : resolved;
}

/** Legt das Elternverzeichnis an und meldet, ob die DB-Datei neu ist. */
export function ensureDatabasePath(path: string): {
  path: string;
  created: boolean;
} {
  mkdirSync(dirname(path), { recursive: true });
  return { path, created: !existsSync(path) };
}

export function getActivePath(): string {
  const envPath = getEnvDatabasePath();
  if (envPath) {
    return resolveDbPath(envPath);
  }
  return resolveDbPath("data/marketmind.db");
}
