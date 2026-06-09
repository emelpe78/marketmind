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

export interface PromptLibraryEntry {
  id: number;
  name: string;
  prompt: string;
  agent_id: number | null;
  created_at: string;
}

export function useAgents() {
  const { data: agents, refresh } = useFetch<Agent[]>("/api/agents");
  const { data: prompts, refresh: refreshPrompts } = useFetch<
    PromptLibraryEntry[]
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

  async function savePromptToLibrary(
    name: string,
    prompt: string,
    agentId?: number | null,
  ) {
    await $fetch("/api/prompt-library", {
      method: "POST",
      body: {
        name,
        prompt,
        agent_id: agentId ?? null,
      },
    });
    await Promise.all([refreshPrompts(), refresh()]);
  }

  async function updatePromptLibrary(entry: PromptLibraryEntry) {
    await $fetch(`/api/prompt-library/${entry.id}`, {
      method: "PUT",
      body: {
        name: entry.name,
        prompt: entry.prompt,
        agent_id: entry.agent_id ?? null,
      },
    });
    await Promise.all([refreshPrompts(), refresh()]);
  }

  async function deletePromptLibrary(id: number) {
    await $fetch(`/api/prompt-library/${id}`, { method: "DELETE" });
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
    updatePromptLibrary,
    deletePromptLibrary,
    formatTemperature,
    formatUsdCost,
    formatCallsLabel,
  };
}
