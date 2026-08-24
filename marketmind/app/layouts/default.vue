<script setup lang="ts">
import { AGENTS_NAV_ITEMS, isAgentsRoute } from "shared/agent-nav";
import {
  FLIPPING_ICON,
  FLIPPING_NAV_ITEMS,
  isFlippingRoute,
} from "shared/flipping-nav";
import {
  LISTINGS_ICON,
  LISTINGS_NAV_ITEMS,
  isListingsRoute,
} from "shared/listings-nav";
import { BRAND_ICON, GITHUB_REPO_URL } from "shared/brand";
import {
  RESEARCH_ICON,
  RESEARCH_NAV_ITEMS,
  isResearchRoute,
} from "shared/research-nav";

const colorMode = useColorMode();
const { public: publicConfig } = useRuntimeConfig();
const route = useRoute();

const dashboardNavItem = {
  label: "Dashboard",
  icon: "i-lucide-layout-dashboard",
  to: "/",
};

const middleNavItems = [
  { label: "Inventar", icon: "i-lucide-package", to: "/inventory" },
  { label: "Watchlist", icon: "i-lucide-eye", to: "/watchlist" },
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
const listingsNavOpen = ref(isListingsRoute(route.path));
const researchNavOpen = ref(isResearchRoute(route.path));

watch(
  () => route.path,
  (path) => {
    if (isAgentsRoute(path)) {
      agentsNavOpen.value = true;
    }
    if (isFlippingRoute(path)) {
      flippingNavOpen.value = true;
    }
    if (isListingsRoute(path)) {
      listingsNavOpen.value = true;
    }
    if (isResearchRoute(path)) {
      researchNavOpen.value = true;
    }
  },
);

function toggleAgentsNav() {
  agentsNavOpen.value = !agentsNavOpen.value;
}

function toggleFlippingNav() {
  flippingNavOpen.value = !flippingNavOpen.value;
}

function toggleListingsNav() {
  listingsNavOpen.value = !listingsNavOpen.value;
}

function toggleResearchNav() {
  researchNavOpen.value = !researchNavOpen.value;
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
        <div class="flex items-start gap-2.5">
          <UIcon
            :name="BRAND_ICON"
            class="size-8 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div class="min-w-0">
            <div class="flex items-baseline gap-2">
              <h1 class="text-lg font-bold text-highlighted">MarketMind</h1>
              <span class="text-xs text-muted"
                >v. {{ publicConfig.appVersion }}</span
              >
            </div>
            <p class="text-xs text-muted">eBay & Kleinanzeigen</p>
          </div>
        </div>
      </div>
      <nav class="flex flex-col gap-1">
        <UButton
          v-bind="navButtonProps"
          :to="dashboardNavItem.to"
          :icon="dashboardNavItem.icon"
          exact
          class="justify-start"
          block
        >
          {{ dashboardNavItem.label }}
        </UButton>

        <div class="flex flex-col gap-1">
          <UButton
            data-testid="nav-research-toggle"
            v-bind="navButtonProps"
            :icon="RESEARCH_ICON"
            :active="isResearchRoute(route.path)"
            class="justify-start"
            block
            @click="toggleResearchNav"
          >
            <span class="flex-1 text-left">Preisrecherche</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform"
              :class="{ 'rotate-180': researchNavOpen }"
            />
          </UButton>
          <div
            v-show="researchNavOpen"
            class="ml-3 flex flex-col gap-1 border-l border-muted pl-2"
          >
            <UButton
              v-for="child in RESEARCH_NAV_ITEMS"
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
            data-testid="nav-listings-toggle"
            v-bind="navButtonProps"
            :icon="LISTINGS_ICON"
            :active="isListingsRoute(route.path)"
            class="justify-start"
            block
            @click="toggleListingsNav"
          >
            <span class="flex-1 text-left">Anzeigen</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 transition-transform"
              :class="{ 'rotate-180': listingsNavOpen }"
            />
          </UButton>
          <div
            v-show="listingsNavOpen"
            class="ml-3 flex flex-col gap-1 border-l border-muted pl-2"
          >
            <UButton
              v-for="child in LISTINGS_NAV_ITEMS"
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

        <UButton
          v-for="item in middleNavItems"
          :key="item.to"
          v-bind="navButtonProps"
          :to="item.to"
          :icon="item.icon"
          class="justify-start"
          block
        >
          {{ item.label }}
        </UButton>

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
      <div class="mt-auto pt-4 border-t border-muted">
        <UButton
          :href="GITHUB_REPO_URL"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="github-link"
          icon="i-lucide-github"
          variant="ghost"
          color="neutral"
          size="sm"
          class="justify-start w-full"
          block
        >
          GitHub
        </UButton>
      </div>
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
