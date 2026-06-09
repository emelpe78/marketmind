import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    exclude: ["test/e2e/**"],
    setupFiles: ["test/helpers/setup.ts"],
    alias: {
      "~": resolve(__dirname, "."),
      "@": resolve(__dirname, "."),
      shared: resolve(__dirname, "shared"),
    },
  },
});
