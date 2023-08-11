import rootname from "./rootname.js";

export default ({names, data}) => `
  import * as components from "app";
  import {hydrate} from "app";

  const root = hydrate(
    globalThis.window.document.body,
    components.${rootname}, 
    {
      components: [${names.map(name => `components.${name}`).join(", ")}],
      data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
    }
  );
`;
