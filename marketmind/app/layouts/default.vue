<script setup lang="ts">
const colorMode = useColorMode();

const navItems = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/" },
  { label: "Preisrecherche", icon: "i-lucide-search", to: "/research" },
  { label: "Anzeigen", icon: "i-lucide-file-text", to: "/listings" },
  { label: "Flipping", icon: "i-lucide-calculator", to: "/flipping" },
  { label: "Watchlist", icon: "i-lucide-eye", to: "/watchlist" },
  { label: "Inventar", icon: "i-lucide-package", to: "/inventory" },
  { label: "Agents", icon: "i-lucide-bot", to: "/agents" },
  { label: "Einstellungen", icon: "i-lucide-settings", to: "/settings" },
];

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <div class="flex min-h-screen bg-default">
    <aside
      class="w-64 border-r border-muted bg-elevated p-4 flex flex-col gap-2"
    >
      <div class="mb-4 px-2">
        <h1 class="text-lg font-bold text-highlighted">MarketMind</h1>
        <p class="text-xs text-muted">eBay & Kleinanzeigen</p>
      </div>
      <nav class="flex flex-col gap-1">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          variant="ghost"
          color="neutral"
          class="justify-start"
          block
        >
          {{ item.label }}
        </UButton>
      </nav>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header
        class="border-b border-muted bg-elevated px-6 py-3 flex items-center justify-between"
      >
        <slot name="header">
          <span class="text-sm text-muted">Lokales Reseller-Tool</span>
        </slot>
        <UButton
          data-testid="theme-toggle"
          :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          variant="ghost"
          color="neutral"
          aria-label="Theme wechseln"
          @click="toggleTheme"
        />
      </header>
      <main class="flex-1 p-6 overflow-y-auto overflow-x-hidden min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
