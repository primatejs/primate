import { AppContext } from "@primate/frontend/solid";
import { useContext } from "solid-js";
import locale from "./locale.js";

export default (key, placeholders) => {
  locale.init();
  const { i18n } = useContext(AppContext).context();
  return i18n.locales[i18n.locale][key] ?? key;
};

export { locale };
