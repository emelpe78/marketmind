import { getDb } from "../../database/db";

export default defineEventHandler((event) => {
  const db = getDb();
  const format = getQuery(event).format || "json";
  const prompts = db
    .prepare("SELECT * FROM prompt_library ORDER BY name")
    .all();

  if (format === "txt") {
    const text = (prompts as { name: string; prompt: string }[])
      .map((p) => `# ${p.name}\n${p.prompt}\n`)
      .join("\n---\n\n");
    setHeader(event, "Content-Type", "text/plain; charset=utf-8");
    setHeader(event, "Content-Disposition", "attachment; filename=prompts.txt");
    return text;
  }

  setHeader(event, "Content-Type", "application/json");
  setHeader(event, "Content-Disposition", "attachment; filename=prompts.json");
  return prompts;
});
