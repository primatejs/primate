import resolve from "@primate/i18n/base/resolve";
import { getContext } from "svelte";
import { derived } from "svelte/store";
import locale_store from "./locale.js";

export default derived(locale_store, locale => (key, placeholders) => {
  const { locales } = getContext("__primate__").i18n;
  return resolve(locales[locale], key, placeholders);
});
