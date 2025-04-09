import handler from "@primate/html/handler";
import type Frontend from "@primate/core/frontend";

export default ((name, props, options = {}) => async (app, _, request) => {
  const code = "import { htmx } from \"app\";";
  const { head, integrity } = await app.inline(code, "module");
  const script_src = [integrity];

  return handler(name, props, { head,
    csp: { script_src },
    partial: Boolean(request.headers["hx-request"]),
    ...options,
  })(app, _, request);
}) as Frontend;
