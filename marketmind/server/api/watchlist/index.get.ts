import { getDb } from "../../database/db";
import { findAllWatchlist } from "../../services/watchlist/repository";

export default defineEventHandler(() => findAllWatchlist(getDb()));
