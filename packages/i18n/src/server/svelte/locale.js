import save from "#save";
import { getContext } from "svelte";
import { writable } from "svelte/store";

const store = writable("", set => {
  const { locale } = getContext("__primate__").i18n;
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
