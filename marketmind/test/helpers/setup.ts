import { beforeEach, afterEach } from "vitest";
import { createTestDb, cleanupTestDb } from "./test-db";

beforeEach(() => {
  createTestDb();
});

afterEach(() => {
  cleanupTestDb();
});
