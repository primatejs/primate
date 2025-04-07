import type { RequestHook } from "#module-loader";
import type { ServeApp } from "#serve/app";
import local_storage from "#session/storage";

type CookieOptions = {
  path: string;
  secure: boolean;
  http_only: "; HttpOnly" | "";
  same_site: "Strict" | "Lax" | "None";
};

type Cookie = (name: string, options: CookieOptions) => string;

const cookie: Cookie = (value, { path, secure, http_only, same_site }) =>
  `${value};${http_only};Path=${path};Secure=${secure};SameSite=${same_site}`;

export default (app: ServeApp): RequestHook => async (request, next) => {
  const { name, ...cookie_options } = app.config("session.cookie");
  const manager = app.config("session.manager");

  const id = request.cookies[name];
  const session = manager.get(id as string);

  const response = await new Promise<Response>(resolve => {
    local_storage.run(session, async () => {
      resolve(await next(request) as Response);
    });
  });

  if (session.new || session.id === id) {
    return response;
  }

  // if the session is in the pool and has a different id from the cookie, set
  const options: CookieOptions = {
    ...cookie_options,
    http_only: cookie_options.http_only ? "; HttpOnly" : "",
    secure: app.secure,
  };

  // commit any session changes if necessary
  await manager.commit();

  response.headers.set("Set-Cookie", cookie(`${name}=${session.id}`, options));
};
