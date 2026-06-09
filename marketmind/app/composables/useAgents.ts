import {
  formatCallsLabel,
  formatTemperature,
  formatUsdCost,
} from "shared/format-agent";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import {
  refreshAfterAgentCall,
  refreshAgentsData,
} from "~/utils/refresh-fetch-data";

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
  const { data: agents } = useFetch<Agent[]>("/api/agents", {
    key: FETCH_KEYS.agents,
  });
  const { data: prompts } = useFetch<PromptLibraryEntry[]>(
    "/api/prompt-library",
    {
      key: FETCH_KEYS.promptLibrary,
    },
  );
  const { data: history } = useFetch<Array<Record<string, unknown>>>(
    "/api/agent-history",
    {
      key: FETCH_KEYS.agentHistory,
    },
  );
  const loading = ref(false);

  async function saveAgent(agent: Agent) {
    await $fetch(`/api/agents/${agent.id}`, { method: "PUT", body: agent });
    await refreshAgentsData();
  }

  async function generatePrompt(description: string) {
    loading.value = true;
    try {
      const result = await $fetch<{ prompt: string }>(
        "/api/agents/generate-prompt",
        {
          method: "POST",
          body: { description },
        },
      );
      await refreshAfterAgentCall();
      return result;
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
    await refreshAgentsData();
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
    await refreshAgentsData();
  }

  async function deletePromptLibrary(id: number) {
    await $fetch(`/api/prompt-library/${id}`, { method: "DELETE" });
    await refreshAgentsData();
  }

  return {
    agents,
    prompts,
    history,
    loading,
    refreshAgentsData,
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
