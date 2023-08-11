export default `
  import {hydrateRoot} from "react-dom/client";
  import React from "react";

  export const hydrate = (target, ...args) =>
    hydrateRoot(target, React.createElement(...args));
`;
