import { AGENTS_FETCH_KEYS, FETCH_KEYS, type FetchKey } from "./fetch-keys";

export async function refreshFetchData(...keys: FetchKey[]) {
  if (keys.length === 0) {
    await refreshNuxtData();
    return;
  }

  await Promise.all(keys.map((key) => refreshNuxtData(key)));
}

export async function refreshAllFetchData() {
  await refreshNuxtData();
}

export async function refreshAgentsData() {
  await refreshFetchData(...AGENTS_FETCH_KEYS);
}

export async function refreshDashboardData() {
  await refreshFetchData(FETCH_KEYS.dashboard);
}

export async function refreshAgentHistoryData() {
  await refreshFetchData(FETCH_KEYS.agentHistory);
}

export async function refreshAfterAgentCall() {
  await refreshFetchData(FETCH_KEYS.agentHistory, FETCH_KEYS.dashboard);
}
