export class SearchNotFoundError extends Error {
  constructor() {
    super("Suche nicht gefunden");
    this.name = "SearchNotFoundError";
  }
}

export class MissingQueryError extends Error {
  constructor() {
    super("Suchbegriff fehlt");
    this.name = "MissingQueryError";
  }
}

export class NoAnalysisDataError extends Error {
  constructor() {
    super("Keine Preisdaten für die Analyse vorhanden");
    this.name = "NoAnalysisDataError";
  }
}

export class AiNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiNotConfiguredError";
  }
}

export function mapDomainError(
  error: unknown,
): { statusCode: number; message: string } | null {
  if (error instanceof SearchNotFoundError) {
    return { statusCode: 404, message: error.message };
  }
  if (error instanceof MissingQueryError) {
    return { statusCode: 400, message: error.message };
  }
  if (error instanceof NoAnalysisDataError) {
    return { statusCode: 400, message: error.message };
  }
  if (error instanceof AiNotConfiguredError) {
    return { statusCode: 400, message: error.message };
  }
  return null;
}
