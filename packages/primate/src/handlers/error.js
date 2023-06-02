import statuses from "../statuses.js";

export default (body = "Not Found", {status = statuses.NotFound} = {}) =>
  async (app, headers) => [
    await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    },
  ];
