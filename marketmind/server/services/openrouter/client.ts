import type { AiConnection } from "../ai/config";

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

function authHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

export async function fetchModels(
  connection: AiConnection,
  fetchFn: FetchFn = fetch,
): Promise<OpenRouterModel[]> {
  const response = await fetchFn(`${connection.baseUrl}/models`, {
    headers: authHeaders(connection.apiKey),
  });
  if (!response.ok) {
    throw new Error(`AI models failed: ${response.status}`);
  }
  const data = (await response.json()) as {
    data: { id: string; name?: string }[];
  };
  return data.data.map((m) => ({ id: m.id, name: m.name || m.id }));
}

export async function chatCompletion(
  connection: AiConnection,
  model: string,
  messages: ChatMessage[],
  temperature = 0.7,
  fetchFn: FetchFn = fetch,
): Promise<ChatCompletionResult> {
  const response = await fetchFn(`${connection.baseUrl}/chat/completions`, {
    method: "POST",
    headers: authHeaders(connection.apiKey),
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!response.ok) {
    throw new Error(`AI chat failed: ${response.status}`);
  }
  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
    usage?: { total_tokens?: number; cost?: number };
    model: string;
  };
  const tokensUsed = data.usage?.total_tokens ?? 0;
  const costUsd = data.usage?.cost ?? 0;
  return {
    content: data.choices[0]?.message?.content ?? "",
    tokensUsed,
    costUsd,
    model: data.model,
  };
}
