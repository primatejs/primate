import compile from "@primate/frontend/common/compile";
import rootname from "./rootname.js";

const server = text => `import { HTML } from "rcompat/string";
  export default (props = {}, options) => {
  const encoded = JSON.parse(HTML.escape(JSON.stringify(props)));
  const keys = Object.keys(encoded);
  const values = Object.values(encoded);
  const text = ${JSON.stringify(text)};
  return new Function(...keys, \`return \\\`\${text}\\\`;\`)(...values);
}`;

export default extension => async (app, next) => {
  app.register(extension, {
    ...await compile({
      app,
      extension,
      rootname,
      compile: { server },
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
