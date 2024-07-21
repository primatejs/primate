export default `
  import React from "react";
  const { createElement } = React;
  export { createElement };
  export { hydrateRoot } from "react-dom/client";
  export { default as ReactHead } from "@primate/frontend/react/head";
`;
