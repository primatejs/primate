import { AppContext } from "@primate/frontend/solid";
import { useContext } from "solid-js";
import save from "../shared/save.js";

const $ = {
  context: Symbol("context"),
  setContext: Symbol("setContext"),
};

export default {
  [$.context]: undefined,
  [$.setContext]: undefined,
  get() {
    this.init();
    return this[$.context].i18n.locale;
  },
  set(locale) {
    this.init();
    this[$.setContext]({
        ...this[$.context],
        i18n: {
          locale,
          locales: this[$.context].i18n.locales,
        },
      });
    save(locale);
  },
  init() {
    if (this[$.context] !== undefined) {
      return;
    }

    const { context, setContext } = useContext(AppContext);
    this[$.context] = context();
    this[$.setContext] = setContext;
  },
};
