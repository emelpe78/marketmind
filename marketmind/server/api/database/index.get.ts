import { getDatabaseInfo } from "../../database/lifecycle";

export default defineEventHandler(() => {
  return getDatabaseInfo();
});
