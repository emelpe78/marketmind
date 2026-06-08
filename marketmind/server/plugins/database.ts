import { getDbPath, initDatabase, getTableNames } from "../database/db";
import { getSetting, seedDatabase, setSetting } from "../database/seed";

export default defineNitroPlugin(() => {
  const db = initDatabase();
  seedDatabase(db);
  if (!getSetting(db, "database-path")) {
    setSetting(db, "database-path", getDbPath());
  }
});

export { getDb, getTableNames, initDatabase };
