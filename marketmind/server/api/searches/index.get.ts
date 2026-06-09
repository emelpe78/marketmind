import { getDb } from "../../database/db";
import { findAllSearches } from "../../services/searches/repository";

export default defineEventHandler(() => findAllSearches(getDb()));
