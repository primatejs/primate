import every from "@rcompat/invariant/every";
import is from "@rcompat/invariant/is";
import make_session from "./make_session.js";
import local_storage from "./storage.js";

const cookie = (name, value, { path, secure, httpOnly, sameSite }) =>
  `${name}=${value};${httpOnly};Path=${path};${secure};SameSite=${sameSite}`;

// gets a cookie id and returns it if exists, otherwise generates a new one
const in_memory_session_manager = () => {
  const store = new Map();
  return id => make_session(store, id);
};

export default ({
  name = "session_id",
  sameSite = "Strict",
  httpOnly = true,
  path = "/",
  manager = in_memory_session_manager(),
  implicit = false,
} = {}) => {
  every(name, sameSite, path).string();
  is(httpOnly).boolean();
  is(manager).function();

  const options = {
    sameSite,
    path,
    httpOnly: httpOnly ? ";HttpOnly" : "",
  };

  return {
    name: "primate:session",
    init(app, next) {
      options.secure = app.secure ? ";Secure" : "";
      return next(app);
    },
    async handle(request, next) {
      const id = request.cookies[name];
      const session = manager(id);

      every(session.create, session.destroy).function();

      const response = await new Promise(resolve => {
        local_storage.run(session, async () => {
          resolve(await next({ ...request, session }));
        });
      });

      implicit && session.create();

      // only send the cookie if different than the received one
      if (session.id !== id && session.id !== undefined) {
        response.headers.set("Set-Cookie", cookie(name, session.id, options));
      }

      return response;
    },
  };
};
