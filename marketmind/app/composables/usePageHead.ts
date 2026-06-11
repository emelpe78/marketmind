import type { MaybeRefOrGetter } from "vue";
import { toValue } from "vue";

export function usePageHead(
  title: MaybeRefOrGetter<string>,
  description?: MaybeRefOrGetter<string>,
) {
  useHead({
    title: () => toValue(title),
    meta: description
      ? [{ name: "description", content: () => toValue(description) }]
      : [],
  });
}
