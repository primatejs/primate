import { writable } from "svelte/store";
import { getContext } from "svelte";

const store = writable("", set => {
  const { locale } = getContext("__primate__").i18n;
  set(locale);

  return () => undefined;
});

export default store;
