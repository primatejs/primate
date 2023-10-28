import { AppContext } from "@primate/frontend/solid";
import { useContext } from "solid-js";
import reactive_locale from "./locale.js";
import resolve from "../shared/resolve.js";

export default (key, placeholders) => {
  reactive_locale.init();
  const { locales, locale } = useContext(AppContext).context().i18n;
  return resolve(locales[locale], key, placeholders);
};

export { reactive_locale as locale };
