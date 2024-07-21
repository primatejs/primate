import html_handler from "@primate/frontend/base/html-handler";

export default (name, props, options = {}) => async (app, _, request) => {
  const code = "import { htmx } from \"app\";";
  const { head , integrity } = await app.inline(code, "module");
  const script_src = [integrity];

  return html_handler(name, props, { head: [head],
    csp: { script_src },
    partial: Boolean(request.headers.get("hx-request")),
    ...options,
  })(app, _, request);
};
