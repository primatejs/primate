import context_name from "#context-name";
import locale_store from "#i18n/locale";
import resolve from "@primate/i18n/resolve";
import type Dictionary from "@rcompat/record/Dictionary";
import { getContext } from "poly";
import { derived } from "poly/store";
import type ContextData from "@primate/i18n/ContextData";

type Context = {
  i18n: ContextData;  
}

export default derived(locale_store, locale => (key: string, placeholders: Dictionary<string>) => {
  const { locales } = getContext<Context>(context_name).i18n;
  return resolve(locales[locale], key, placeholders);
});
