import { initDatabase, getDb, getTableNames } from "../database/db";
import { seedDatabase } from "../database/seed";

export default defineNitroPlugin(() => {
  const db = initDatabase();
  seedDatabase(db);
});

export { getDb, getTableNames, initDatabase };
