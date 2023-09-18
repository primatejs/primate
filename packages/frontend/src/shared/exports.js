export {default as ReactHeadContext} from "../components/react/HeadContext.js";
export {default as ReactHead} from "../components/react/Head.js";

const is_client = globalThis.document?.createElement !== undefined;
const is = {
  client: is_client,
  server: !is_client,
};

export {is};
