export default (component, props) => `
  import {hydrate} from "app";
  import * as components from "app";

  const data = JSON.parse(${JSON.stringify(JSON.stringify(props))});
  hydrate(document.body, components.${component}, data);
`;
