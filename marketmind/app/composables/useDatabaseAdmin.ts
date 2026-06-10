import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFetchData } from "~/utils/refresh-fetch-data";

export interface DatabaseInfo {
  path: string;
  exists: boolean;
}

export async function useDatabaseAdmin() {
  const { data: databaseInfo } = await useFetch<DatabaseInfo>("/api/database", {
    key: FETCH_KEYS.database,
  });

  async function refreshDatabase() {
    await refreshFetchData(FETCH_KEYS.database);
  }

  async function resetDatabase() {
    return $fetch<{ path: string }>("/api/database/reset", {
      method: "POST",
      body: { confirm: true },
    });
  }

  return {
    databaseInfo,
    refreshDatabase,
    resetDatabase,
  };
}
