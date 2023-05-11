import {NotFound} from "../http-statuses.js";

export default (body = "Not Found", {status = NotFound} = {}) =>
  async (app, headers) => [
    await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    },
  ];
