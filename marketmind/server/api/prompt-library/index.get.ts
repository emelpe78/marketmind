import { getDb } from "../../database/db";
import { findAllPrompts } from "../../services/prompt-library/repository";

export default defineEventHandler(() => findAllPrompts(getDb()));
