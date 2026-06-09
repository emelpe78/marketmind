<script setup lang="ts">
import { getAgentIcon } from "shared/agent-icons";
import { formatCallsLabel, formatUsdCost } from "shared/format-agent";
import { getAgentUsage } from "shared/agent-usage";
import { FLIPPING_ICON } from "shared/flipping-nav";
import { RESEARCH_ICON } from "shared/research-nav";
import { LISTINGS_ICON } from "shared/listings-nav";

definePageMeta({ layout: "default" });

const { dashboard, pending } = await useDashboard();

interface DashboardCard {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  valueClass?: string;
  testId?: string;
  to?: string;
}

function routeWhen(count: number, path: string): string | undefined {
  return count > 0 ? path : undefined;
}

const researchCards = computed((): DashboardCard[] => {
  const data = dashboard.value;
  if (!data) return [];

  return [
    {
      label: "Gespeicherte Recherchen",
      value: String(data.savedResearchCount),
      icon: "i-lucide-bookmark",
      iconClass: "bg-primary/10 text-primary",
      testId: "kpi-saved-researches",
      to: routeWhen(data.savedResearchCount, "/research/saved"),
    },
    {
      label: "Flipping-Analysen",
      value: String(data.savedFlipAnalysisCount),
      icon: FLIPPING_ICON,
      iconClass: "bg-primary/10 text-primary",
      testId: "kpi-flip-analyses",
      to: routeWhen(data.savedFlipAnalysisCount, "/flipping/analyses"),
    },
    {
      label: "Gespeicherte Anzeigen",
      value: String(data.savedListingCount),
      icon: LISTINGS_ICON,
      iconClass: "bg-muted text-default",
      testId: "kpi-saved-listings",
      to: routeWhen(data.savedListingCount, "/listings/saved"),
    },
    {
      label: "Watchlist-Einträge",
      value: String(data.watchlistItemCount),
      icon: "i-lucide-eye",
      iconClass: "bg-muted text-default",
      testId: "kpi-watchlist-items",
      to: routeWhen(data.watchlistItemCount, "/watchlist"),
    },
    {
      label: "Watchlist-Alerts",
      value: String(data.watchlistAlerts),
      icon: "i-lucide-bell",
      iconClass: "bg-warning/10 text-warning",
      valueClass: data.watchlistAlerts > 0 ? "text-warning" : undefined,
      testId: "kpi-watchlist-alerts",
      to: routeWhen(data.watchlistAlerts, "/watchlist"),
    },
  ];
});

const inventoryCards = computed((): DashboardCard[] => {
  const data = dashboard.value;
  if (!data) return [];

  const summary = data.inventorySummary;
  const soldRoute = routeWhen(summary.soldCount, "/inventory");
  const openRoute = routeWhen(data.openInventoryCount, "/inventory");

  return [
    {
      label: "Gesamtgewinn",
      value: formatEuro(summary.totalProfit),
      icon: "i-lucide-trending-up",
      iconClass: "bg-success/10 text-success",
      valueClass: "text-success",
      testId: "kpi-total-profit",
      to: soldRoute,
    },
    {
      label: "Ø Marge",
      value: formatPercent(summary.avgMargin),
      icon: "i-lucide-percent",
      iconClass: "bg-success/10 text-success",
      testId: "kpi-avg-margin",
      to: soldRoute,
    },
    {
      label: "Verkaufte Artikel",
      value: String(summary.soldCount),
      icon: "i-lucide-circle-check",
      iconClass: "bg-success/10 text-success",
      testId: "kpi-sold-items",
      to: soldRoute,
    },
    {
      label: "Offenes Inventar",
      value: String(data.openInventoryCount),
      icon: "i-lucide-package",
      iconClass: "bg-warning/10 text-warning",
      valueClass: data.openInventoryCount > 0 ? "text-warning" : undefined,
      testId: "kpi-open-inventory",
      to: openRoute,
    },
  ];
});

const usageCards = computed((): DashboardCard[] => {
  const data = dashboard.value;
  if (!data) return [];

  const historyRoute = routeWhen(data.agentCallCount, "/agents/history");

  return [
    {
      label: "KI-Aufrufe",
      value: String(data.agentCallCount),
      icon: "i-lucide-activity",
      iconClass: "bg-primary/10 text-primary",
      testId: "kpi-agent-calls",
      to: historyRoute,
    },
    {
      label: "Token-Kosten",
      value: formatUsdCost(data.tokenCosts),
      icon: "i-lucide-circle-dollar-sign",
      iconClass: "bg-muted text-default",
      testId: "kpi-token-costs",
      to: historyRoute,
    },
    {
      label: "Prompt-Bibliothek",
      value: String(data.promptLibraryCount),
      icon: "i-lucide-library",
      iconClass: "bg-muted text-default",
      testId: "kpi-prompt-library",
      to: routeWhen(data.promptLibraryCount, "/agents/prompt-generator"),
    },
    {
      label: "KI-Provider",
      value: data.aiConfigured
        ? data.aiProvider === "openrouter"
          ? "OpenRouter"
          : "Lokal"
        : "Nicht konfiguriert",
      icon: "i-lucide-bot",
      iconClass: data.aiConfigured
        ? "bg-success/10 text-success"
        : "bg-warning/10 text-warning",
      valueClass: data.aiConfigured ? "text-success" : "text-warning",
      testId: "kpi-ai-provider",
      to: "/settings",
    },
  ];
});

const highlightCards = computed(() => {
  const summary = dashboard.value?.inventorySummary;
  if (!summary) return [];

  const cards: Array<{
    label: string;
    title: string;
    profit: string;
    tone: "success" | "error";
    icon: string;
    iconClass: string;
    to: string;
  }> = [];

  if (summary.bestFlip) {
    cards.push({
      label: "Bester Flip",
      title: summary.bestFlip.title,
      profit: formatEuro(summary.bestFlip.profit),
      tone: "success",
      icon: "i-lucide-trophy",
      iconClass: "bg-success/10 text-success",
      to: "/inventory",
    });
  }

  if (summary.worstFlip) {
    const worstIsLoss = summary.worstFlip.profit < 0;
    cards.push({
      label: "Schlechtester Flip",
      title: summary.worstFlip.title,
      profit: formatEuro(summary.worstFlip.profit),
      tone: worstIsLoss ? "error" : "success",
      icon: "i-lucide-trending-down",
      iconClass: worstIsLoss
        ? "bg-error/10 text-error"
        : "bg-success/10 text-success",
      to: "/inventory",
    });
  }

  return cards;
});

function agentCardRoute(type: string): string | undefined {
  return getAgentUsage(type)?.route;
}

const kpiIconWrapClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg leading-none";
const kpiIconClass = "size-5 shrink-0 block";
</script>

<template>
  <div v-if="pending" class="text-muted">Lade Dashboard...</div>
  <div v-else class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Dashboard</h2>
      <p class="text-muted mt-1">
        Überblick über Recherche, Inventar, Agents und KI-Nutzung
      </p>
    </div>

    <UAlert
      v-if="dashboard && !dashboard.aiConfigured"
      data-testid="ai-setup-hint"
      color="warning"
      variant="subtle"
      icon="i-lucide-sparkles"
      title="KI-Provider konfigurieren"
      description="Nach dem ersten Start oder einem Datenbank-Reset sind die KI-Funktionen noch nicht nutzbar. Hinterlege unter Einstellungen → API entweder OpenRouter oder eine lokale OpenAI-kompatible KI."
    >
      <template #actions>
        <UButton to="/settings" size="sm" color="neutral" variant="solid">
          Zu den Einstellungen
        </UButton>
      </template>
    </UAlert>

    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Recherche & Tools
      </h3>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        <DashboardKpiCard
          v-for="card in researchCards"
          :key="card.label"
          :to="card.to"
          :test-id="card.testId"
        >
          <div class="flex items-start gap-3">
            <div :class="[kpiIconWrapClass, card.iconClass]">
              <UIcon :name="card.icon" :class="kpiIconClass" />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-muted">{{ card.label }}</p>
              <p
                class="text-2xl font-bold text-highlighted truncate"
                :class="card.valueClass"
              >
                {{ card.value }}
              </p>
            </div>
          </div>
        </DashboardKpiCard>
      </div>
    </section>

    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
        Inventar
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCard
          v-for="card in inventoryCards"
          :key="card.label"
          :to="card.to"
          :test-id="card.testId"
        >
          <div class="flex items-start gap-3">
            <div :class="[kpiIconWrapClass, card.iconClass]">
              <UIcon :name="card.icon" :class="kpiIconClass" />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-muted">{{ card.label }}</p>
              <p
                class="text-2xl font-bold text-highlighted truncate"
                :class="card.valueClass"
              >
                {{ card.value }}
              </p>
            </div>
          </div>
        </DashboardKpiCard>
      </div>

      <div
        v-if="highlightCards.length"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <DashboardKpiCard
          v-for="card in highlightCards"
          :key="card.label"
          :to="card.to"
          test-id="kpi-flip-highlight"
        >
          <div class="flex items-start gap-3">
            <div :class="[kpiIconWrapClass, card.iconClass]">
              <UIcon :name="card.icon" :class="kpiIconClass" />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-muted">{{ card.label }}</p>
              <p class="text-sm font-semibold text-highlighted mt-1 truncate">
                {{ card.title }}
              </p>
              <p
                class="text-lg font-bold mt-1"
                :class="card.tone === 'error' ? 'text-error' : 'text-success'"
              >
                {{ card.profit }}
              </p>
            </div>
          </div>
        </DashboardKpiCard>
      </div>
    </section>

    <section v-if="dashboard?.agents?.length" class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          Agents
        </h3>
        <UButton
          to="/agents/feature-agents"
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-right"
          trailing
        >
          Verwalten
        </UButton>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCard
          v-for="agent in dashboard.agents"
          :key="agent.id"
          :to="agentCardRoute(agent.type)"
          :test-id="`kpi-agent-${agent.type}`"
        >
          <div class="flex items-start gap-3">
            <div :class="[kpiIconWrapClass, 'bg-primary/10 text-primary']">
              <UIcon :name="getAgentIcon(agent.type)" :class="kpiIconClass" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-highlighted truncate">
                {{ agent.name }}
              </p>
              <p v-if="getAgentUsage(agent.type)" class="text-xs text-muted">
                {{ getAgentUsage(agent.type)?.feature }}
              </p>
              <p class="text-sm text-muted mt-2">
                {{ formatCallsLabel(agent.callCount) }}
              </p>
              <p class="text-lg font-bold text-highlighted">
                {{ formatUsdCost(agent.totalCostUsd) }}
              </p>
            </div>
          </div>
        </DashboardKpiCard>
      </div>
    </section>

    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
        KI & Nutzung
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCard
          v-for="card in usageCards"
          :key="card.label"
          :to="card.to"
          :test-id="card.testId"
        >
          <div class="flex items-start gap-3">
            <div :class="[kpiIconWrapClass, card.iconClass]">
              <UIcon :name="card.icon" :class="kpiIconClass" />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-muted">{{ card.label }}</p>
              <p
                class="text-2xl font-bold text-highlighted truncate"
                :class="card.valueClass"
              >
                {{ card.value }}
              </p>
            </div>
          </div>
        </DashboardKpiCard>
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <UButton :icon="RESEARCH_ICON" to="/research"> Preisrecherche </UButton>
      <UButton :icon="LISTINGS_ICON" to="/listings" variant="outline">
        Anzeige erstellen
      </UButton>
      <UButton :icon="FLIPPING_ICON" to="/flipping" variant="outline">
        Flipping analysieren
      </UButton>
      <UButton
        to="/agents/feature-agents"
        icon="i-lucide-bot"
        variant="outline"
      >
        Feature-Agents
      </UButton>
    </div>
  </div>
</template>
