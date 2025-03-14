import { createContext } from "react";
import type Dictionary from "@rcompat/record/Dictionary";
import type ContextData from "@primate/i18n/ContextData";

type Context = {
  i18n: ContextData;  
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
