import {Status, MediaType} from "runtime-compat/http";

export default (body, {status = Status.OK} = {}) => app => [
  body, {
    status,
    headers: {...app.headers(), "Content-Type":
      MediaType.APPLICATION_OCTET_STREAM},
  },
];
