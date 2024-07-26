import AppContext from "@primate/frontend/solid/context/app";
import resolve from "@primate/i18n/base/resolve";
import { useContext } from "solid-js";
import locale_store from "./locale.js";

export default (key, placeholders) => {
  locale_store.init();
  const { locales, locale } = useContext(AppContext).context().i18n;
  return resolve(locales[locale], key, placeholders);
};
