export interface MarkdownDisplay {
  title: string | null;
  html: string;
}

export interface MarkdownSection {
  label: string;
  content: string;
  html: string;
}

export interface MarkdownSectionsDisplay {
  title: string | null;
  preambleHtml: string | null;
  sections: MarkdownSection[];
  hasSections: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyMarkdownFormatting(text: string): string {
  return escapeHtml(text)
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold text-default">$1</strong>',
    )
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function formatInlineMarkdown(text: string): string {
  const smallBlocks: string[] = [];
  const brTags: string[] = [];

  let result = text.replace(/<br\s*\/?>/gi, () => {
    brTags.push("<br />");
    return `\x00BR${brTags.length - 1}\x00`;
  });

  result = result.replace(/<small>([\s\S]*?)<\/small>/gi, (_, inner) => {
    smallBlocks.push(
      `<small class="text-xs text-muted">${applyMarkdownFormatting(inner)}</small>`,
    );
    return `\x00SM${smallBlocks.length - 1}\x00`;
  });

  result = applyMarkdownFormatting(result);

  return result
    .replace(/\x00SM(\d+)\x00/g, (_, index) => smallBlocks[Number(index)] ?? "")
    .replace(/\x00BR(\d+)\x00/g, (_, index) => brTags[Number(index)] ?? "");
}

function isTableSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell.trim()));
}

function parseTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.includes("|")) return null;
  return trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(rows: string[][]): string {
  if (!rows.length) return "";

  let header: string[] | null = null;
  let bodyRows = rows;

  const separatorRow = rows[1];
  const headerRow = rows[0];
  if (
    rows.length > 1 &&
    separatorRow &&
    headerRow &&
    isTableSeparatorRow(separatorRow)
  ) {
    header = headerRow;
    bodyRows = rows.slice(2);
  }

  const headHtml = header
    ? `<thead><tr>${header
        .map(
          (cell) =>
            `<th class="px-3 py-2 text-left font-medium text-highlighted border-b border-default">${formatInlineMarkdown(cell)}</th>`,
        )
        .join("")}</tr></thead>`
    : "";

  const bodyHtml = bodyRows
    .map(
      (row) =>
        `<tr class="border-b border-default/60 last:border-0">${row
          .map(
            (cell) =>
              `<td class="px-3 py-2 text-muted">${formatInlineMarkdown(cell)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return `<div class="my-2 max-w-full overflow-x-hidden rounded-lg border border-default"><table class="w-full max-w-full table-fixed text-sm break-words [overflow-wrap:anywhere]">${headHtml}<tbody>${bodyHtml}</tbody></table></div>`;
}

function isFullWidthHeading(heading: string): boolean {
  return /empfehlung|handlung|fazit|zusammenfassung|bewertung|korrektur/i.test(
    heading,
  );
}

export function extractMarkdownTitle(markdown: string): {
  title: string | null;
  body: string;
} {
  let text = markdown.trim();
  let title: string | null = null;

  const titleMatch = text.match(/^##\s+(.+?)(?:\n|$)/);
  if (titleMatch?.[1]) {
    title = titleMatch[1].trim();
    text = text.slice(titleMatch[0].length).trim();
  }

  return { title, body: text };
}

/** Entfernt Plattform-Hinweise in Klammern, wenn die Plattform separat angezeigt wird. */
export function stripPlatformSuffixFromTitle(
  title: string | null,
): string | null {
  if (!title) return title;
  return title
    .replace(
      /\s*\([^)]*(?:ebay\.de|kleinanzeigen\.de|ebay|kleinanzeigen)[^)]*\)\s*$/i,
      "",
    )
    .trim();
}

function renderBlockquote(lines: string[]): string {
  const content = lines
    .map(
      (line) =>
        `<p class="leading-relaxed">${formatInlineMarkdown(line.replace(/^>\s?/, ""))}</p>`,
    )
    .join("");
  return `<blockquote class="border-s-2 border-primary/60 ps-4 my-2 text-sm text-muted space-y-1">${content}</blockquote>`;
}

export function renderMarkdownBlock(text: string): string {
  const lines = text.split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let tableRows: string[][] = [];

  function closeList() {
    if (!listType) return;
    html.push(listType === "ul" ? "</ul>" : "</ol>");
    listType = null;
  }

  function closeTable() {
    if (!tableRows.length) return;
    html.push(renderTable(tableRows));
    tableRows = [];
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      closeList();
      closeTable();
      html.push('<hr class="my-3 border-default" />');
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeList();
      closeTable();
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const quoteLine = lines[index] ?? "";
        if (!quoteLine.trim().startsWith(">")) break;
        quoteLines.push(quoteLine.trim());
        index++;
      }
      index--;
      html.push(renderBlockquote(quoteLines));
      continue;
    }

    const tableRow = parseTableRow(trimmed);
    if (tableRow) {
      closeList();
      if (isTableSeparatorRow(tableRow)) continue;
      tableRows.push(tableRow);
      continue;
    }

    closeTable();

    if (trimmed.startsWith("#### ")) {
      closeList();
      html.push(
        `<h4 class="text-sm font-medium text-highlighted mt-3 mb-1">${formatInlineMarkdown(trimmed.slice(5))}</h4>`,
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html.push(
        `<h3 class="text-sm font-semibold text-highlighted mt-4 mb-2">${formatInlineMarkdown(trimmed.slice(4))}</h3>`,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      closeList();
      html.push(
        `<h2 class="text-base font-semibold text-highlighted mt-2 mb-1">${formatInlineMarkdown(trimmed.slice(3))}</h2>`,
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (listType !== "ul") {
        closeList();
        html.push(
          '<ul class="my-1 list-disc ps-5 space-y-1 text-sm text-muted">',
        );
        listType = "ul";
      }
      html.push(
        `<li>${formatInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}</li>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== "ol") {
        closeList();
        html.push(
          '<ol class="my-1 list-decimal ps-5 space-y-1 text-sm text-muted">',
        );
        listType = "ol";
      }
      html.push(
        `<li>${formatInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ""))}</li>`,
      );
      continue;
    }

    closeList();
    html.push(
      `<p class="text-sm text-muted leading-relaxed">${formatInlineMarkdown(trimmed)}</p>`,
    );
  }

  closeList();
  closeTable();
  return html.join("");
}

function stripSectionNumber(label: string): string {
  return label.replace(/^\d+\.\s*/, "").trim();
}

function splitMarkdownSections(body: string): {
  preambleText: string;
  sections: Array<{ heading: string; content: string }>;
} {
  const sectionParts = body.split(/^### /m);
  const preambleText = sectionParts[0]?.trim() ?? "";
  const sections = sectionParts.slice(1).map((part) => {
    const newlineIndex = part.indexOf("\n");
    const heading =
      newlineIndex === -1 ? part.trim() : part.slice(0, newlineIndex).trim();
    const content =
      newlineIndex === -1 ? "" : part.slice(newlineIndex + 1).trim();
    return { heading, content };
  });
  return { preambleText, sections };
}

export function parseMarkdownSections(
  markdown: string,
): MarkdownSectionsDisplay {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return {
      title: null,
      preambleHtml: null,
      sections: [],
      hasSections: false,
    };
  }

  const { title, body } = extractMarkdownTitle(trimmed);
  const hasSections = /^### /m.test(body);

  if (!hasSections) {
    return {
      title,
      preambleHtml: body
        ? `<div class="space-y-2">${renderMarkdownBlock(body)}</div>`
        : null,
      sections: [],
      hasSections: false,
    };
  }

  const { preambleText, sections } = splitMarkdownSections(body);
  const preambleHtml = preambleText
    ? `<div class="space-y-2">${renderMarkdownBlock(preambleText)}</div>`
    : null;

  return {
    title,
    preambleHtml,
    sections: sections.map(({ heading, content }) => ({
      label: stripSectionNumber(heading),
      content,
      html: content
        ? `<div class="space-y-2">${renderMarkdownBlock(content)}</div>`
        : "",
    })),
    hasSections: true,
  };
}

function renderSectionCards(body: string): string {
  const { preambleText, sections } = splitMarkdownSections(body);
  const htmlParts: string[] = [];

  if (preambleText) {
    htmlParts.push(
      `<div class="space-y-2 mb-4">${renderMarkdownBlock(preambleText)}</div>`,
    );
  }

  if (sections.length) {
    const cards = sections
      .map(({ heading, content }) => {
        const widthClass = isFullWidthHeading(heading) ? "sm:col-span-2" : "";
        const bodyHtml = content ? renderMarkdownBlock(content) : "";
        return `<div class="rounded-lg border border-default bg-elevated/30 p-4 ${widthClass}"><h3 class="text-sm font-semibold text-highlighted mb-2">${formatInlineMarkdown(heading)}</h3><div class="space-y-2">${bodyHtml}</div></div>`;
      })
      .join("");
    htmlParts.push(`<div class="grid gap-3 sm:grid-cols-2">${cards}</div>`);
  }

  return htmlParts.join("");
}

/** @deprecated Use renderMarkdownDocument */
export function renderAnalysisMarkdown(markdown: string): {
  title: string;
  html: string;
} {
  const display = renderMarkdownDocument(markdown);
  return {
    title: display.title ?? "KI-Zusammenfassung",
    html: display.html,
  };
}

export function renderMarkdownDocument(markdown: string): MarkdownDisplay {
  const trimmed = markdown.trim();
  if (!trimmed) return { title: null, html: "" };

  const { title, body } = extractMarkdownTitle(trimmed);
  const hasSections = /^### /m.test(body);

  if (hasSections) {
    return { title, html: renderSectionCards(body) };
  }

  return {
    title,
    html: `<div class="space-y-2">${renderMarkdownBlock(body)}</div>`,
  };
}

/** @deprecated Use extractMarkdownTitle */
export const extractAnalysisTitle = extractMarkdownTitle;
