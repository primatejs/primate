import { derived } from "svelte/store";
import { getContext } from "svelte";
import locale_store from "./locale.js";

export default derived(locale_store, locale => (key, placeholders) => {
  const { locales } = getContext("__primate__").i18n;
  return locales[locale][key] ?? key;
});
