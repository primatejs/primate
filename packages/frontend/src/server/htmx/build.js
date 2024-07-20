import compile from "@primate/frontend/common/compile";
import depend from "@primate/frontend/common/depend";
import peerdeps from "@primate/frontend/common/peerdeps";
import MissingClientSideTemplateDependency
  from "@primate/frontend/errors/missing-client-side-template-dependency";
import * as O from "rcompat/object";
import name from "./name.js";
import rootname from "./rootname.js";

const dependencies = ["htmx-esm"];
const on = O.filter(peerdeps(), ([key]) => dependencies.includes(key));
const templates = "client-side-templates";
const htmx_esm = "htmx-esm";
const base_import_template = (subpath, app) =>
  app.build.export(`export * from "${htmx_esm}/${templates}/${subpath}";`);

const import_template = {
  handlebars: app => base_import_template("handlebars", app),
  mustache: app => base_import_template("mustache", app),
  nunjucks: app => base_import_template("nunjucks", app),
  // noop
  xslt: _ => _,
};

const server = text => `import { HTML } from "rcompat/string";
  export default (props = {}, options) => {
  const encoded = JSON.parse(HTML.escape(JSON.stringify(props)));
  const keys = Object.keys(encoded);
  const values = Object.values(encoded);
  const text = ${JSON.stringify(text)};
  return new Function(...keys, \`return \\\`\${text}\\\`;\`)(...values);
}`;

export default ({
  extension,
  extensions,
  client_side_templates,
}) => async (app, next) => {
  await depend(on, `frontend:${name}`);

  app.build.export(`export { default as htmx } from "${htmx_esm}";`);

  extensions.forEach(extension_name =>
    app.build.export(`export * from "${htmx_esm}/${extension_name}";`));

  if (!O.empty(client_side_templates)) {
    if (!extensions.includes(templates)) {
      MissingClientSideTemplateDependency.throw(templates,
        client_side_templates.join(", "));
    }
    client_side_templates.forEach(client_side_template =>
      import_template[client_side_template](app));
  }

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
