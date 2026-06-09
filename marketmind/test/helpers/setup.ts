import { beforeEach, afterEach } from "vitest";
import {
  defineEventHandler,
  createError,
  getRouterParam,
  getQuery,
  readBody,
} from "h3";
import { createTestDb, cleanupTestDb } from "./test-db";

// Nitro auto-imports for API handler tests
Object.assign(globalThis, {
  defineEventHandler,
  createError,
  getRouterParam,
  getQuery,
  readBody,
});

beforeEach(() => {
  createTestDb();
});

afterEach(() => {
  cleanupTestDb();
});
