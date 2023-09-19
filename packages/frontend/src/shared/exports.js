export {default as ReactHeadContext} from "../components/react/HeadContext.js";
export {default as ReactHead} from "../components/react/Head.js";

export {default as SolidHeadContext} from "../components/solid/HeadContext.js";
export {default as SolidHead} from "../components/solid/Head.js";

const is_client = globalThis.document?.createElement !== undefined;
const is = {
  client: is_client,
  server: !is_client,
};

export {is};
