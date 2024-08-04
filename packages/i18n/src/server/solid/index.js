import resolve from "#resolve";
import AppContext from "@primate/solid/context/app";
import { useContext } from "solid-js";
import locale_store from "./locale.js";

export default (key, placeholders) => {
  locale_store.init();
  const { locales, locale } = useContext(AppContext).context().i18n;
  return resolve(locales[locale], key, placeholders);
};
