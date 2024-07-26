import AppContext from "@primate/frontend/solid/context/app";
import save from "@primate/i18n/base/save";
import { useContext } from "solid-js";

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
