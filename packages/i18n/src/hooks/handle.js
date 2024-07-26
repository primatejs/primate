import { Status } from "rcompat/http";
import name from "@primate/i18n/base/name";

const cookie = (key, value, { path, secure, httpOnly, sameSite }) =>
  `${key}=${value};${httpOnly};Path=${path};${secure};SameSite=${sameSite}`;
const options = {
  sameSite: "Strict" ,
  path: "/",
  httpOnly: "HttpOnly",
};

export default ({ env }) => (request, next) => {
  if (!env.active) {
    return next(request);
  }

  const set_locale = request.headers.get("primate-i18n-locale");

  if (set_locale === undefined) {
    return next(request);
  }

  return new Response("", {
    status: Status.OK,
    headers: {
      "Set-Cookie": cookie(name, set_locale, options),
    },
  });
};
