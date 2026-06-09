<script setup lang="ts">
import { AGENTS_NAV_ITEMS, isAgentsRoute } from "shared/agent-nav";
import {
  FLIPPING_ICON,
  FLIPPING_NAV_ITEMS,
  isFlippingRoute,
} from "shared/flipping-nav";

const colorMode = useColorMode();
const { public: publicConfig } = useRuntimeConfig();
const route = useRoute();

const mainNavItems = [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/" },
  { label: "Preisrecherche", icon: "i-lucide-search", to: "/research" },
  { label: "Anzeigen", icon: "i-lucide-file-text", to: "/listings" },
  { label: "Watchlist", icon: "i-lucide-eye", to: "/watchlist" },
  { label: "Inventar", icon: "i-lucide-package", to: "/inventory" },
];

const settingsNavItem = {
  label: "Einstellungen",
  icon: "i-lucide-settings",
  to: "/settings",
};

const navButtonProps = {
  variant: "ghost" as const,
  color: "neutral" as const,
  activeVariant: "ghost" as const,
  activeColor: "primary" as const,
};

const agentsNavOpen = ref(isAgentsRoute(route.path));
const flippingNavOpen = ref(isFlippingRoute(route.path));

watch(
  () => route.path,
  (path) => {
    if (isAgentsRoute(path)) {
      agentsNavOpen.value = true;
    }
    if (isFlippingRoute(path)) {
      flippingNavOpen.value = true;
    }
  },
);

function toggleAgentsNav() {
  agentsNavOpen.value = !agentsNavOpen.value;
}

function toggleFlippingNav() {
  flippingNavOpen.value = !flippingNavOpen.value;
}

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
        <div class="flex items-baseline gap-2">
          <h1 class="text-lg font-bold text-highlighted">MarketMind</h1>
          <span class="text-xs text-muted"
            >v. {{ publicConfig.appVersion }}</span
          >
        </div>
        <p class="text-xs text-muted">eBay & Kleinanzeigen</p>
      </div>
      <nav class="flex flex-col gap-1">
        <UButton
          v-for="item in mainNavItems"
          :key="item.to"
          v-bind="navButtonProps"
          :to="item.to"
          :icon="item.icon"
          :exact="item.to === '/'"
          class="justify-start"
          block
        >
          {{ item.label }}
        </UButton>

        <div class="flex flex-col gap-1">
          <UButton
            data-testid="nav-flipping-toggle"
            v-bind="navButtonProps"
            :icon="FLIPPING_ICON"
            :active="isFlippingRoute(route.path)"
            class="justify-start"
            block
            @click="toggleFlippingNav"
          >
            <span class="flex-1 text-left">Flipping</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform"
              :class="{ 'rotate-180': flippingNavOpen }"
            />
          </UButton>
          <div
            v-show="flippingNavOpen"
            class="ml-3 flex flex-col gap-1 border-l border-muted pl-2"
          >
            <UButton
              v-for="child in FLIPPING_NAV_ITEMS"
              :key="child.to"
              v-bind="navButtonProps"
              :to="child.to"
              :data-testid="child.testId"
              size="sm"
              class="justify-start"
              block
            >
              {{ child.label }}
            </UButton>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <UButton
            data-testid="nav-agents-toggle"
            v-bind="navButtonProps"
            icon="i-lucide-bot"
            :active="isAgentsRoute(route.path)"
            class="justify-start"
            block
            @click="toggleAgentsNav"
          >
            <span class="flex-1 text-left">Agents</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform"
              :class="{ 'rotate-180': agentsNavOpen }"
            />
          </UButton>
          <div
            v-show="agentsNavOpen"
            class="ml-3 flex flex-col gap-1 border-l border-muted pl-2"
          >
            <UButton
              v-for="child in AGENTS_NAV_ITEMS"
              :key="child.to"
              v-bind="navButtonProps"
              :to="child.to"
              :data-testid="child.testId"
              size="sm"
              class="justify-start"
              block
            >
              {{ child.label }}
            </UButton>
          </div>
        </div>

        <UButton
          v-bind="navButtonProps"
          :to="settingsNavItem.to"
          :icon="settingsNavItem.icon"
          class="justify-start"
          block
        >
          {{ settingsNavItem.label }}
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
