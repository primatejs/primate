import compile from "@primate/frontend/base/compile";
import NoClientExtension from "@primate/frontend/errors/no-client-extension";
import { name } from "@primate/frontend/htmx/common";
import empty from "@rcompat/object/empty";
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
  app.build.export(`export { default as htmx } from "${htmx_esm}";`);

  extensions.forEach(extension_name =>
    app.build.export(`export * from "${htmx_esm}/${extension_name}";`));

  if (!empty(client_side_templates)) {
    const has_templates = extensions.includes(templates);
    //app.assert(has_templates, nce(templates, client_side_templates.join(",")));
    if (!has_templates) {
      NoClientExtension.throw(templates, client_side_templates.join(", "));
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
