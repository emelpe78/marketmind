import { describe, expect, it } from "vitest";
import {
  formatInlineMarkdown,
  renderMarkdownBlock,
  renderMarkdownDocument,
} from "../../app/utils/render-markdown";

describe("render-markdown", () => {
  it("formats bold markdown safely", () => {
    expect(formatInlineMarkdown("Preis **249,99 €**")).toContain("<strong");
    expect(formatInlineMarkdown("Preis **249,99 €**")).toContain("249,99 €");
    expect(formatInlineMarkdown("<script>")).toContain("&lt;script&gt;");
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

  it("renders unstructured text as single block", () => {
    const display = renderMarkdownDocument(
      "Kurze Analyse ohne Markdown-Struktur.",
    );
    expect(display.html).toContain("Kurze Analyse");
    expect(display.title).toBeNull();
  });
});
