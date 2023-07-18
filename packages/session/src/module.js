import crypto from "runtime-compat/crypto";
import {is} from "runtime-compat/dyndef";

const cookie = (name, value, {path, secure, sameSite}) =>
  `${name}=${value};HttpOnly;Path=${path};${secure};SameSite=${sameSite}`;

// gets a cookie id and returns it if exists, otherwise generates a new one
const inMemorySessionManager = () => {
  const store = new Map();
  return id => {
    let _id = id;
    return {
      get exists() {
        return store.has(_id);
      },
      get() {
        return store.get(_id) ?? {};
      },
      set(key, value) {
        if (this.exists) {
          store.set(_id, {...this.get(), [key]: value});
        }
      },
      async create(data = {}) {
        console.log("CREATE");
        /* dynamic to prevent multiple calls to create */
        if (!this.exists) {
          _id = crypto.randomUUID();
          store.set(_id, data);
        }
      },
        /* dynamic to prevent multiple calls to destroy */
      destroy() {
        if (this.exists) {
          store.delete(_id);
        }
      },
    };
  };
};

export default ({
  name = "sessionId",
  sameSite = "Strict",
  path = "/",
  manager = inMemorySessionManager(),
  implicit = false,
} = {}) => {
  is(name).string();
  is(sameSite).string();
  is(path).string();
  is(manager).function();
  const options = {sameSite, path};
  return {
    name: "@primate/session",
    init(app = {}) {
      options.secure = app.secure ? ";Secure" : "";
    },
    async handle(request, next) {
      const id = request.cookies.get(name);
      const session = manager(id);
      is(session.create).function();
      is(session.destroy).function();

      const response = await next({...request, session});

      implicit && await session.create();

      // only send the cookie if different than the received one
      if (session.id !== id && session.id !== undefined) {
        response.headers.set("Set-Cookie", cookie(name, session.id, options));
      }

      return response;
    },
  };
};
