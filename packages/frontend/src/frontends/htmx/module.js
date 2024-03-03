import o from "rcompat/object";
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

const base_import_template = async (name, app) => {
  const from = `htmx-esm/client-side-templates/${name}`;
  const code = `export * from "${from}";`;
  app.export({ type: "script", code });
};

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
  const on = o.filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      return next(app);
    },
    async register(app, next) {
      const code = "export { default as htmx } from \"htmx-esm\";";
      await app.export({ type: "script", code });
      app.register(extension, { handle });

      for (const name of extensions) {
        const code = `export * from "htmx-esm/${name}";`;
        app.export({ type: "script", code });
      }

      if (Object.keys(client_side_templates).length > 0) {
        const base = "client-side-templates";
        const templates = client_side_templates.join(", ");

        if (!extensions.includes(base)) {
          errors.MissingClientSideTemplateDependency.throw(base, templates);
        }
        for (const template of client_side_templates) {
          await import_template[template](app);
        }
      }

      return next(app);
    },
  };
};
