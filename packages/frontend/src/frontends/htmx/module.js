import * as O from "rcompat/object";
import { html } from "primate";
import errors from "./errors.js";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const handle = (name, props, options = {}) => async (app, _, request) => {
  const code = "import { htmx } from \"app\";";
  const { head, integrity } = await app.inline(code, "module");
  const script_src = [integrity];

  return html(name, props, {
    head: [head],
    csp: { script_src },
    partial: Boolean(request.headers.get("hx-request")),
    ...options,
  })(app, _, request);
};

const htmx = "htmx-esm";
const templates = "client-side-templates";

const base_import_template = (name, app) =>
  app.build.export(`export * from "${htmx}/${templates}/${name}";`);

const import_template = {
  handlebars: app => base_import_template("handlebars", app),
  mustache: app => base_import_template("mustache", app),
  nunjucks: app => base_import_template("nunjucks", app),
  // noop
  xslt: _ => _,
};

export default ({
  extension = ".htmx",
  extensions = [],
  client_side_templates = [],
} = {}) => {
  const name = "htmx";
  const dependencies = ["htmx-esm"];
  const on = O.filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      app.register(extension, { handle });

      return next(app);
    },
    async build(app, next) {
      app.build.export(`export { default as htmx } from "${htmx}";`);

      extensions.forEach(extension_name =>
        app.build.export(`export * from "${htmx}/${extension_name}";`));

      if (!O.empty(client_side_templates)) {
        if (!extensions.includes(templates)) {
          errors.MissingClientSideTemplateDependency.throw(templates,
            client_side_templates.join(", "));
        }
        client_side_templates.forEach(client_side_template =>
          import_template[client_side_template](app));
      }

      return next(app);
    },
  };
};
