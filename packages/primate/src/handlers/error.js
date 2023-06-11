import {Status} from "runtime-compat/http";

export default (body = "Not Found", {status = Status.NotFound} = {}) =>
  async app => [
    await app.render({body}), {
      status,
      headers: {...app.headers(), "Content-Type": "text/html"},
    },
  ];
