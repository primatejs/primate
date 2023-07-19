import {Status, MediaType} from "runtime-compat/http";

export default (body = "Not Found", {status = Status.NOT_FOUND} = {}) =>
  async app => [
    await app.render({body}), {
      status,
      headers: {...app.headers(), "Content-Type": MediaType.TEXT_HTML},
    },
  ];
