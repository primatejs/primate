import header from "#header";
import type Manager from "#Manager";
import modulename from "#name";
import type { RequestHook } from "@primate/core/hook";
import Status from "@rcompat/http/Status";

type Cookie = {
  [key in "path" | "secure" | "httpOnly" | "sameSite"]: string
};

const cookie = (name: string, value: string, { path, secure, httpOnly, sameSite }: Cookie) =>
  `${name}=${value};${httpOnly};Path=${path};${secure};SameSite=${sameSite}`;

const options = {
  sameSite: "Strict" ,
  path: "/",
  httpOnly: "HttpOnly",
  secure: "Secure",
};

export default (manager: Manager): RequestHook => (request, next) => {
  if (!manager.active) {
    return next(request);
  }

  const set_locale = request.headers.get(header);

  if (set_locale === null) {
    return next(request);
  }

  return new Response("", {
    status: Status.OK,
    headers: {
      "Set-Cookie": cookie(modulename, set_locale, options),
    },
  });
};
