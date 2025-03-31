import context_name from "#context-name";
import locale_store from "#i18n/locale";
import resolve from "@primate/i18n/resolve";
import { getContext } from "svelte";
import { derived } from "svelte/store";
import type Dictionary from "@rcompat/record/Dictionary";
import type Context from "#i18n/Context";

export default derived(locale_store, locale =>
  (key: string, placeholders: Dictionary<string>) => {
  const { locales } = getContext<Context>(context_name).i18n;
  return resolve(locales[locale], key, placeholders);
});
