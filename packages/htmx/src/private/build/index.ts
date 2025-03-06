import no_client_extension from "#error/no-client-extension";
import name from "#name";
import type { BuildApp } from "@primate/core/build/app";
import compile from "@primate/core/frontend/compile";
import type { BuildAppHook } from "@primate/core/hook";
import empty from "@rcompat/record/empty";
import server from "./server.js";

const templates = "client-side-templates";
const htmx_esm = "htmx-esm";
const base_import_template = (subpath: string, app: BuildApp) =>
  app.build.export(`export * from "${htmx_esm}/${templates}/${subpath}";`);

const import_template = {
  handlebars: (app: BuildApp) => base_import_template("handlebars", app),
  mustache: (app: BuildApp) => base_import_template("mustache", app),
  nunjucks: (app: BuildApp) => base_import_template("nunjucks", app),
  // noop
  xslt: () => undefined,
};

type Options = {
  extension: string;
  extensions: string[];
  client_side_templates: (keyof typeof import_template)[];
}

export default ({
  extension,
  extensions,
  client_side_templates,
}: Options): BuildAppHook => async (app, next) => {
  app.build.export(`export { default as htmx } from "${htmx_esm}";`);

  extensions.forEach(extension_name =>
    app.build.export(`export * from "${htmx_esm}/${extension_name}";`));

  if (!empty(client_side_templates)) {
    const has_templates = extensions.includes(templates);
    // app.assert(has_templates, nce(templates, client_side_templates.join(",")));
    has_templates ||
      no_client_extension(templates, client_side_templates.join(", "));
    client_side_templates.forEach(client_side_template =>
      import_template[client_side_template](app));
  }

  app.register(extension, {
    ...compile({ extension, name, compile: { server }, }),
  });

  return next(app);
};
