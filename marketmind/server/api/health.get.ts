import { getHealthStatus } from "../services/health";

export default defineEventHandler(() => {
  return getHealthStatus();
});
