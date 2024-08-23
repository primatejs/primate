export default `
  import React from "react";
  import { hydrateRoot, createRoot } from "react-dom/client";
  const { createElement } = React;
  export { createElement };
  export { default as ReactHead } from "@primate/react/head";

  const make_root = {
    ssr: (dom_node, react_node) => hydrateRoot(dom_node, react_node),
    csr: (dom_node, react_node) => createRoot(dom_node).render(react_node),
  };

  export { make_root };
`;
