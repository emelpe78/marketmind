import { getDb } from "../database/db";
import { getDashboardSummary } from "../services/dashboard/summary";

export default defineEventHandler(() => getDashboardSummary(getDb()));
