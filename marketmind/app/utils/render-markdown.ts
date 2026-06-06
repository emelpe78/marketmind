export interface MarkdownDisplay {
  title: string | null;
  html: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold text-default">$1</strong>',
    )
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
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

  if (rows.length > 1 && isTableSeparatorRow(rows[1])) {
    header = rows[0];
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

  return `<div class="my-2 overflow-x-auto rounded-lg border border-default"><table class="w-full text-sm">${headHtml}<tbody>${bodyHtml}</tbody></table></div>`;
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
  if (titleMatch) {
    title = titleMatch[1].trim();
    text = text.slice(titleMatch[0].length).trim();
  }

  return { title, body: text };
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
    const line = lines[index];
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
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim());
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

function renderSectionCards(body: string): string {
  const sectionParts = body.split(/^### /m);
  const preambleText = sectionParts[0]?.trim() ?? "";
  const sections = sectionParts.slice(1);
  const htmlParts: string[] = [];

  if (preambleText) {
    htmlParts.push(
      `<div class="space-y-2 mb-4">${renderMarkdownBlock(preambleText)}</div>`,
    );
  }

  if (sections.length) {
    const cards = sections
      .map((part) => {
        const newlineIndex = part.indexOf("\n");
        const heading =
          newlineIndex === -1
            ? part.trim()
            : part.slice(0, newlineIndex).trim();
        const content =
          newlineIndex === -1 ? "" : part.slice(newlineIndex + 1).trim();
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
