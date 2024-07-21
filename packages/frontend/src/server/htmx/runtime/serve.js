import html_handler from "@primate/frontend/base/html-handler";
import register from "@primate/frontend/base/register";
import { rootname } from "@primate/frontend/htmx/common";

const handler = ({ load }) => (name, props, options = {}) =>
  async (app, _, request) => {
    const code = "import { htmx } from \"app\";";
    const { head , integrity } = await app.inline(code, "module");
    const script_src = [integrity];

    return html_handler({ load })(name, props, { head: [head],
      csp: { script_src },
      partial: Boolean(request.headers.get("hx-request")),
      ...options,
    })(app, _, request);
  };

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
