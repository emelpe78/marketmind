export interface OpenRouterModel {
  id: string;
  name: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  tokensUsed: number;
  costUsd: number;
  model: string;
}

export type FetchFn = typeof fetch;

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export async function fetchModels(
  apiKey: string,
  fetchFn: FetchFn = fetch,
): Promise<OpenRouterModel[]> {
  const response = await fetchFn(`${OPENROUTER_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`OpenRouter models failed: ${response.status}`);
  }
  const data = (await response.json()) as {
    data: { id: string; name?: string }[];
  };
  return data.data.map((m) => ({ id: m.id, name: m.name || m.id }));
}

export async function chatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature = 0.7,
  fetchFn: FetchFn = fetch,
): Promise<ChatCompletionResult> {
  const response = await fetchFn(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!response.ok) {
    throw new Error(`OpenRouter chat failed: ${response.status}`);
  }
  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
    usage?: { total_tokens?: number };
    model: string;
  };
  const tokensUsed = data.usage?.total_tokens ?? 0;
  return {
    content: data.choices[0]?.message?.content ?? "",
    tokensUsed,
    costUsd: tokensUsed * 0.000001,
    model: data.model,
  };
}
