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

  async function downloadSqlBackup(): Promise<string> {
    const response = await fetch("/api/database/backup");
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message || "Backup fehlgeschlagen");
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    const filename =
      disposition?.match(/filename="([^"]+)"/)?.[1] ??
      `marketmind-backup-${new Date().toISOString().slice(0, 10)}.sql`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return filename;
  }

  async function restoreDatabaseFromSql(file: File) {
    const formData = new FormData();
    formData.append("sql", file);
    formData.append("confirm", "true");

    return $fetch<{ path: string }>("/api/database/restore", {
      method: "POST",
      body: formData,
    });
  }

  return {
    databaseInfo,
    refreshDatabase,
    resetDatabase,
    downloadSqlBackup,
    restoreDatabaseFromSql,
  };
}
