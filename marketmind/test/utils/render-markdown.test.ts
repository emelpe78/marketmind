import { describe, expect, it } from "vitest";
import {
  formatInlineMarkdown,
  parseMarkdownSections,
  renderMarkdownBlock,
  renderMarkdownDocument,
  stripPlatformSuffixFromTitle,
} from "../../app/utils/render-markdown";

describe("render-markdown", () => {
  it("strips platform suffix from analysis titles", () => {
    expect(
      stripPlatformSuffixFromTitle("Marktanalyse: RTX 3060 12GB (eBay.de)"),
    ).toBe("Marktanalyse: RTX 3060 12GB");
    expect(
      stripPlatformSuffixFromTitle(
        "Marktanalyse für „RTX 3060 12GB“ (gebraucht, eBay.de)",
      ),
    ).toBe("Marktanalyse für „RTX 3060 12GB“");
    expect(
      stripPlatformSuffixFromTitle(
        "Marktanalyse: RTX 3060 12GB (Kleinanzeigen.de)",
      ),
    ).toBe("Marktanalyse: RTX 3060 12GB");
  });

  it("formats bold markdown safely", () => {
    expect(formatInlineMarkdown("Preis **249,99 €**")).toContain("<strong");
    expect(formatInlineMarkdown("Preis **249,99 €**")).toContain("249,99 €");
    expect(formatInlineMarkdown("<script>")).toContain("&lt;script&gt;");
  });

  it("renders allowed small tags with inner markdown", () => {
    const html = renderMarkdownBlock(
      "<small>**Datenbasis:** 17 Angebote, ausschließlich Kleinanzeigen.de.</small>",
    );

    expect(html).toContain("<small");
    expect(html).toContain("<strong");
    expect(html).toContain("Datenbasis");
    expect(html).not.toContain("&lt;small&gt;");
    expect(html).not.toContain("&lt;/small&gt;");
  });

  it("renders ### sections once without duplicate fallback", () => {
    const sample = `## Marktanalyse für „RTX 3060 12GB“ (gebraucht, eBay.de)

Datenbasis: **20 aktuelle eBay-Angebote**.

### 1. Preisspanne & Auffälligkeiten
- **Minimalpreis:** 125 €
- **Maximalpreis:** 300 €

### 2. Kernstatistik
| Kennzahl | Mit 125 € | Ohne 125 € |
|----------|------------|------------|
| Median | 249,99 € | 257,50 € |

### 4. Empfehlung
Verkäufer sollten **230–260 €** anpeilen.`;

    const display = renderMarkdownDocument(sample);

    expect(display.title).toContain("RTX 3060 12GB");
    expect(display.html).toContain("<strong");
    expect(display.html).toContain("<h3");
    expect(display.html).toContain("<table");
    expect(display.html).toContain("Minimalpreis");
    expect(display.html.match(/Minimalpreis/g)?.length).toBe(1);
    expect(display.html).not.toContain("###");
  });

  it("renders flipping-style markdown with tables and blockquotes", () => {
    const sample = `### 🔍 Bewertung
| Kriterium | Detail |
|-----------|--------|
| **Einkauf** | 100 € |
| **Verkauf** | 200 € |

> ⚠️ **Korrektur:** Die Marge wurde neu berechnet.

### ✅ Fazit
**Sehr lohnenswert** bei privatem Verkauf.`;

    const display = renderMarkdownDocument(sample);

    expect(display.html).toContain("<table");
    expect(display.html).toContain("<blockquote");
    expect(display.html).toContain("Korrektur");
    expect(display.html).not.toContain("###");
    expect(display.html).not.toContain("| **Einkauf** |");
  });

  it("renders plain markdown blocks with headings and lists", () => {
    const html = renderMarkdownBlock(`### Hinweis
Text mit **Fett**.

- Punkt eins
- Punkt zwei`);

    expect(html).toContain("<h3");
    expect(html).toContain("<ul");
    expect(html).not.toContain("###");
  });

  it("parses ### sections for tabbed analysis layout", () => {
    const sample = `## Marktanalyse für „RTX 3060 12GB“

**Plattform:** eBay.de

### 1. Preisübersicht (Gebraucht)
| Kennzahl | Wert |
|----------|------|
| Median | 217,00 € |

### 2. Marktbewertung
- Preisniveau stabil`;

    const parsed = parseMarkdownSections(sample);

    expect(parsed.title).toContain("RTX 3060 12GB");
    expect(parsed.hasSections).toBe(true);
    expect(parsed.preambleHtml).toContain("eBay.de");
    expect(parsed.sections).toHaveLength(2);
    expect(parsed.sections[0]?.label).toBe("Preisübersicht (Gebraucht)");
    expect(parsed.sections[1]?.label).toBe("Marktbewertung");
    expect(parsed.sections[0]?.html).toContain("<table");
    expect(parsed.sections[1]?.html).toContain("stabil");
  });

  it("renders unstructured text as single block", () => {
    const display = renderMarkdownDocument(
      "Kurze Analyse ohne Markdown-Struktur.",
    );
    expect(display.html).toContain("Kurze Analyse");
    expect(display.title).toBeNull();
  });
});
