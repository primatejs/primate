import crypto from "runtime-compat/crypto";
import {is} from "runtime-compat/dyndef";

const cookie = (name, value, {path, secure, sameSite}) =>
  `${name}=${value};HttpOnly;Path=${path};${secure};SameSite=${sameSite}`;

// gets a cookie id and returns it if exists, otherwise generates a new one
const inMemorySessionManager = () => {
  const store = new Map();
  return id => ({
    id: store.has(id) ? id : undefined,
    get: () => store.get(id) ?? {},
    async create(data = {}) {
      /* dynamic to prevent multiple calls to create */
      if (!store.has(id)) {
        this.id = crypto.randomUUID();
        store.set(this.id, data);
      }
    },
      /* dynamic to prevent multiple calls to destroy */
    destroy() {
      if (store.has(id)) {
        store.delete(id);
      }
    },
  });
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
    load(app = {}) {
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
