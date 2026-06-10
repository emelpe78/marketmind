import type { H3Event } from "h3";

export function parseRouteId(event: H3Event, param = "id"): number {
  const id = Number(getRouterParam(event, param));
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }
  return id;
}

export function parseRouteParam(event: H3Event, param: string): string {
  const value = getRouterParam(event, param);
  if (!value) {
    throw createError({ statusCode: 400, message: `${param} fehlt` });
  }
  return value;
}
import type Database from "better-sqlite3";
import type { ZodType } from "zod";
import { getDb } from "../database/db";
import { mapDomainError } from "../services/errors";
import { ScraperFetchError } from "../services/scraper/fetcher";

export function defineApiHandler<TBody, TResult>(
  schema: ZodType<TBody>,
  handler: (
    db: Database.Database,
    body: TBody,
    event: H3Event,
  ) => Promise<TResult>,
) {
  return defineEventHandler(async (event) => {
    const rawBody = await readBody(event);
    const parsed = schema.safeParse(rawBody ?? {});
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      throw createError({
        statusCode: 400,
        message: firstIssue?.message ?? "Ungültige Anfrage",
      });
    }

    const db = getDb();

    try {
      return await handler(db, parsed.data, event);
    } catch (error) {
      const domainError = mapDomainError(error);
      if (domainError) {
        throw createError(domainError);
      }
      if (error instanceof ScraperFetchError) {
        throw createError({
          statusCode: 502,
          message: error.message,
          data: {
            status: error.status,
            url: error.url,
            platform: error.platform,
          },
        });
      }
      throw error;
    }
  });
}
