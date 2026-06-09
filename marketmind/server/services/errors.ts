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

export class InvalidFlipInputError extends Error {
  constructor() {
    super("Anzeigen-URL fehlt");
    this.name = "InvalidFlipInputError";
  }
}

export class UnsupportedListingUrlError extends Error {
  constructor() {
    super("Nur eBay- und Kleinanzeigen-URLs werden unterstützt");
    this.name = "UnsupportedListingUrlError";
  }
}

export class ListingScrapeError extends Error {
  constructor() {
    super("Anzeige konnte nicht gelesen werden");
    this.name = "ListingScrapeError";
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
  if (error instanceof InvalidFlipInputError) {
    return { statusCode: 400, message: error.message };
  }
  if (error instanceof UnsupportedListingUrlError) {
    return { statusCode: 400, message: error.message };
  }
  if (error instanceof ListingScrapeError) {
    return { statusCode: 422, message: error.message };
  }
  return null;
}
