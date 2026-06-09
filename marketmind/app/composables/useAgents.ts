import {
  formatCallsLabel,
  formatTemperature,
  formatUsdCost,
} from "shared/format-agent";

export interface Agent {
  id: number;
  name: string;
  type: string;
  model?: string;
  system_prompt: string;
  temperature: number;
  call_count?: number;
  total_cost_usd?: number;
}

export function useAgents() {
  const { data: agents, refresh } = useFetch<Agent[]>("/api/agents");
  const { data: prompts, refresh: refreshPrompts } = useFetch<
    Array<Record<string, unknown>>
  >("/api/prompt-library");
  const { data: history } =
    useFetch<Array<Record<string, unknown>>>("/api/agent-history");
  const loading = ref(false);

  async function saveAgent(agent: Agent) {
    await $fetch(`/api/agents/${agent.id}`, { method: "PUT", body: agent });
    await refresh();
  }

  async function generatePrompt(description: string) {
    loading.value = true;
    try {
      return await $fetch<{ prompt: string }>("/api/agents/generate-prompt", {
        method: "POST",
        body: { description },
      });
    } finally {
      loading.value = false;
    }
  }

  async function savePromptToLibrary(name: string, prompt: string) {
    await $fetch("/api/prompt-library", {
      method: "POST",
      body: { name, prompt, category: "Generiert" },
    });
    await refreshPrompts();
  }

  return {
    agents,
    prompts,
    history,
    loading,
    refresh,
    refreshPrompts,
    saveAgent,
    generatePrompt,
    savePromptToLibrary,
    formatTemperature,
    formatUsdCost,
    formatCallsLabel,
  };
}
