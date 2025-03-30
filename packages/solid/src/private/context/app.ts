import type ContextData from "@primate/i18n/ContextData";
import { createContext, type Accessor, type Setter } from "solid-js";

type Context = {
  i18n: ContextData;
}

type AppContext = {
  context: Accessor<Context>;
  setContext: Setter<Context>;
}

export default createContext<AppContext>();
