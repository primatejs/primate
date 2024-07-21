import compile from "@primate/frontend/base/compile";
import depend from "@primate/frontend/base/depend";
import MissingClientSideTemplateDependency from
  "@primate/frontend/errors/missing-client-side-template-dependency";
import { dependencies, name } from "@primate/frontend/htmx/common";
import * as O from "rcompat/object";
import { server } from "./compile.js";

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

export default ({
  extension,
  extensions,
  client_side_templates,
}) => async (app, next) => {
  await depend(dependencies, name);

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
      name,
      compile: { server },
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
