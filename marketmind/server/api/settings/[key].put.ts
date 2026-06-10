import { defineApiHandler, parseRouteParam } from "../../utils/api-handler";
import { setSetting } from "../../database/settings";
import { settingUpdateBodySchema } from "../schemas/settings";

export default defineApiHandler(
  settingUpdateBodySchema,
  async (db, body, event) => {
    const key = parseRouteParam(event, "key");
    setSetting(db, key, String(body.value));
    return { key, value: body.value };
  },
);
