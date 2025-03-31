import context_name from "#context-name";
import type Context from "#i18n/Context";
import save from "@primate/i18n/save";
import { getContext } from "svelte";
import { writable } from "svelte/store";

const store = writable("", set => {
  const { locale } = getContext<Context>(context_name).i18n;
  set(locale);

  return () => undefined;
});

export default {
  subscribe: store.subscribe,
  set: (locale: string) => {
    store.set(locale);
    save(locale);
  },
};
