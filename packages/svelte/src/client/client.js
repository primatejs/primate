import rootname from "./rootname.js";
import liveview from "./liveview.js";

export default ({names, data}, options) => `
  import * as components from "app";
  const getComponents = names =>
    Object.entries(components).filter(([name, component]) =>
      names.includes(name))
      .map(([, component]) => component);
  let root = new components.${rootname}({
    target: document.body,
    hydrate: true,
    props: {
      components: getComponents([${names.map(name => `"${name}"`)}]),
      data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
    },
  });
  ${options.liveview ? liveview : ""}`;
