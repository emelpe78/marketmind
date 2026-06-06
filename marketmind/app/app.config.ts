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
  },
});
