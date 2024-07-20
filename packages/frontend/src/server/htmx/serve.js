import register from "@primate/frontend/common/register";
import rootname from "./rootname.js";
import html from "../html/handler.js";

const handler = ({ load }) => (name, props, options = {}) =>
  async (app, _, request) => {
    const code = "import { htmx } from \"app\";";
    const { head , integrity } = await app.inline(code, "module");
    const script_src = [integrity];

    return html({ load })(name, props, { head: [head],
      csp: { script_src },
      partial: Boolean(request.headers.get("hx-request")),
      ...options,
    })(app, _, request);
  };

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
