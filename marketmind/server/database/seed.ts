import type Database from "better-sqlite3";
import { DEFAULT_SETTINGS } from "./settings";

const DEFAULT_AGENTS = [
  {
    name: "Research Agent",
    type: "research",
    system_prompt:
      "Du bist ein Marktanalyse-Experte für eBay.de und Kleinanzeigen.de. Analysiere Verkaufspreise, Nachfrage und Konkurrenz. Antworte auf Deutsch, präzise und datenbasiert.",
  },
  {
    name: "Listing Agent",
    type: "listing",
    system_prompt:
      "Du erstellst optimierte Verkaufsanzeigen für eBay und Kleinanzeigen. Passe Ton und Struktur an die Plattform an. Antworte auf Deutsch.",
  },
  {
    name: "Analytics Agent",
    type: "analytics",
    system_prompt:
      "Du bewertest Flipping-Potenzial, Margen und Markttrends für privaten Verkauf ohne Plattformgebühren. Antworte auf Deutsch mit klarer Empfehlung.",
  },
  {
    name: "Strategy Agent",
    type: "strategy",
    system_prompt:
      "Du berätst zu optimalem Kauf- und Verkaufszeitpunkt sowie Risikoeinschätzung. Antworte auf Deutsch, strategisch und handlungsorientiert.",
  },
];

export function seedDatabase(db: Database.Database): void {
  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, value);
  }

  const agentCount = db
    .prepare("SELECT COUNT(*) as count FROM agents")
    .get() as { count: number };
  if (agentCount.count === 0) {
    const insertAgent = db.prepare(
      "INSERT INTO agents (name, type, system_prompt, temperature) VALUES (?, ?, ?, 0.7)",
    );
    for (const agent of DEFAULT_AGENTS) {
      insertAgent.run(agent.name, agent.type, agent.system_prompt);
    }
  }
}
