import { writable } from "svelte/store";
import { getContext } from "svelte";
import save from "../shared/save.js";

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
