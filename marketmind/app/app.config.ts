export default defineAppConfig({
  ui: {
    colors: {
      primary: "emerald",
      neutral: "slate",
    },
    formField: {
      slots: {
        root: "w-full",
        container: "w-full",
      },
    },
    input: {
      slots: {
        root: "relative flex w-full items-center",
      },
    },
    textarea: {
      slots: {
        root: "relative flex w-full items-center",
      },
    },
    slider: {
      slots: {
        root: "relative flex w-full items-center select-none touch-none",
      },
    },
    table: {
      slots: {
        root: "relative min-w-0 max-w-full overflow-x-hidden",
        base: "w-full max-w-full table-fixed",
        th: "px-4 py-3.5 text-sm text-highlighted text-left rtl:text-right font-semibold min-w-0 align-top whitespace-normal break-words [overflow-wrap:anywhere] [&:has([role=checkbox])]:pe-0",
        td: "p-4 text-sm text-muted min-w-0 align-top whitespace-normal break-words [overflow-wrap:anywhere] [&:has([role=checkbox])]:pe-0",
      },
    },
  },
});
