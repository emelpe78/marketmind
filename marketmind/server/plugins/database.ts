import { getDb, getDbPath, initDatabase, getTableNames } from "../database/db";
import { seedDatabase } from "../database/seed";
import { syncAllAgentPrompts } from "../services/prompt-library/agent-sync";
import { getSetting, setSetting } from "../database/settings";

export default defineNitroPlugin(() => {
  const db = initDatabase();
  seedDatabase(db);
  syncAllAgentPrompts(db);
  if (!getSetting(db, "database-path")) {
    setSetting(db, "database-path", getDbPath());
  }
});

export { getDb, getTableNames, initDatabase };
