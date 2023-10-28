import { derived } from "svelte/store";
import { getContext } from "svelte";
import reactive_locale from "./locale.js";
import resolve from "../shared/resolve.js";

export default derived(reactive_locale, locale => (key, placeholders) => {
  const { locales } = getContext("__primate__").i18n;
  return resolve(locales[locale], key, placeholders);
});

export { reactive_locale as locale };
