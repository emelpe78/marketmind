import { getDatabaseInfo } from "../../services/database/admin";

export default defineEventHandler(() => {
  return getDatabaseInfo();
});
