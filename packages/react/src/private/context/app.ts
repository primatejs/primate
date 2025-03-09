import { createContext } from "react";
import type Dictionary from "@rcompat/record/Dictionary";
import type { LocaleContextData } from "#i18n/locale";

type Context = {
  i18n: LocaleContextData;  
}

type AppContext = {
  context: Context,
  setContext: React.Dispatch<Context>,
}

export default createContext<AppContext>({
  context: {
    i18n: {
      locales: {},
      locale: "en-US",
    },
  },
  setContext: (_: Dictionary) => {},
});
