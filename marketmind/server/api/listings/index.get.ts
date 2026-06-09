import { getDb } from "../../database/db";
import { findAllListings } from "../../services/listings/repository";

export default defineEventHandler(() => findAllListings(getDb()));
