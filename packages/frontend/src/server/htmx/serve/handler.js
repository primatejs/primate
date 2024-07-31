import handler from "#html/handler";

export default (name, props, options = {}) => async (app, _, request) => {
  const code = "import { htmx } from \"app\";";
  const { head , integrity } = await app.inline(code, "module");
  const script_src = [integrity];

  return handler(name, props, { head: [head],
    csp: { script_src },
    partial: Boolean(request.headers.get("hx-request")),
    ...options,
  })(app, _, request);
};
