export interface AgentSelectOption {
  label: string;
  value: number | null;
}

export interface AgentLike {
  id: number;
  name: string;
  type: string;
}

export interface PromptAgentAssignmentLike {
  id: number;
  name: string;
  agent_id: number | null;
}

export const PROMPT_ASSIGNMENT_HINT =
  "Pro Agent kann nur ein Prompt zugewiesen sein. Eine neue Zuweisung hebt die bisherige Zuordnung auf und übernimmt den Prompt für den Agent.";

export function buildAssignableAgentOptions(
  agents: AgentLike[],
): AgentSelectOption[] {
  return [
    { label: "Kein Agent", value: null },
    ...agents.map((agent) => ({
      label: agent.name,
      value: agent.id,
    })),
  ];
}

export function agentNameById(
  agents: AgentLike[],
  agentId: number | null | undefined,
): string {
  if (agentId == null) return "Kein Agent";
  const agent = agents.find((entry) => entry.id === agentId);
  return agent?.name ?? `Agent #${agentId}`;
}

export function findAssignedPromptForAgent(
  prompts: PromptAgentAssignmentLike[],
  agentId: number,
  exceptPromptId?: number,
): PromptAgentAssignmentLike | undefined {
  return prompts.find(
    (prompt) => prompt.agent_id === agentId && prompt.id !== exceptPromptId,
  );
}
