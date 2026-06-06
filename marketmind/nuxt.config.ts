// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  experimental: {
    viteEnvironmentApi: true,
  },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "system",
    fallback: "light",
  },
  devServer: {
    port: Number(process.env.MM_PORT) || 5666,
    strictPort: true,
    host: "127.0.0.1",
  },
  runtimeConfig: {
    openrouterApiKey: process.env.MM_OPENROUTER_API_KEY || "",
    defaultModel: process.env.MM_OPENROUTER_MODEL || "deepseek/deepseek-v4-pro",
    databasePath: process.env.MM_DATABASE_PATH || "data/marketmind.db",
    public: {},
  },
});
