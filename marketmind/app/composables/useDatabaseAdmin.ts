export interface DatabaseInfo {
  path: string;
  exists: boolean;
}

export async function useDatabaseAdmin() {
  const { data: databaseInfo, refresh: refreshDatabase } =
    await useFetch<DatabaseInfo>("/api/database");

  async function relocateDatabase(path: string) {
    return $fetch<{ path: string; copied: boolean }>("/api/database/path", {
      method: "PUT",
      body: { path },
    });
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
    relocateDatabase,
    resetDatabase,
  };
}
