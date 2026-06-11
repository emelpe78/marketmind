// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";
import pkg from "./package.json";

export default defineNuxtConfig({
  app: {
    head: {
      title: "MarketMind",
      titleTemplate: "%s · MarketMind",
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
      ],
    },
  },
  icon: {
    clientBundle: {
      icons: ["ph:graph"],
    },
  },
  alias: {
    shared: fileURLToPath(new URL("./shared", import.meta.url)),
  },
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
    port: 5666,
    host: "127.0.0.1",
  },
  runtimeConfig: {
    databasePath: process.env.MM_DATABASE_DEV || "data/marketmind.db",
    public: {
      appVersion: pkg.version,
    },
  },
});
