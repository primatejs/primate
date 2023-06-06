import {Status} from "runtime-compat/http";

export default (body = "Not Found", {status = Status.NotFound} = {}) =>
  async (app, headers) => [
    await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    },
  ];
