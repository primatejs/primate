import { Response, MediaType, Status } from "rcompat/http";

const make = {
  body({ partial = false, body, head, app, page, placeholders }) {
    return partial ? body : app.render({ body, head }, page, placeholders);
  },
  status(options) {
    return options.status ?? Status.OK;
  },
  headers(headers, options) {
    return {
      "Content-Type": MediaType.TEXT_HTML,
      ...headers,
      ...options.headers ?? {},
    };
  },
};

export default async ({
  app,
  body,
  head,
  headers = app.headers(),
  options = {},
} = {}) => new Response(await make.body({ ...options, body, head, app }), {
    status: make.status(options),
    headers: make.headers(headers, options),
  });
