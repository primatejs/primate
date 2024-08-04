import context_name from "#context-name";
import locale_store from "#i18n/locale";
import resolve from "@primate/i18n/core/resolve";
import { getContext } from "svelte";
import { derived } from "svelte/store";

export default derived(locale_store, locale => (key, placeholders) => {
  const { locales } = getContext(context_name).i18n;
  return resolve(locales[locale], key, placeholders);
});
