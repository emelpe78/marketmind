import { defineApiHandler } from "../../utils/api-handler";
import { runResearch } from "../../services/research/run-research";
import { researchRunBodySchema } from "../schemas/research";

export default defineApiHandler(researchRunBodySchema, async (db, body) => {
  return runResearch(db, {
    query: body.query,
    platform: body.platform,
    searchId: body.searchId,
    analyze: body.analyze,
    save: body.save,
    saveName: body.saveName,
  });
});
