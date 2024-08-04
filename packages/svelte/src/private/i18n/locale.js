import context_name from "#context-name";
import save from "@primate/i18n/core/save";
import { getContext } from "svelte";
import { writable } from "svelte/store";

const store = writable("", set => {
  const { locale } = getContext(context_name).i18n;
  set(locale);

  return () => undefined;
});

export default {
  subscribe: store.subscribe,
  set: locale => {
    store.set(locale);
    save(locale);
  },
};
