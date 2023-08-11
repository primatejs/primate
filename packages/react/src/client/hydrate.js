export default `
  import {hydrateRoot} from "react-dom/client";
  import React from "react";

  export const hydrate = (target, ...args) => {
    const root = React.createElement(...args);
    hydrateRoot(target, root);
    return root;
  }
`;
