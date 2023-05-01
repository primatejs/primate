import crypto from "runtime-compat/crypto";
import {is} from "runtime-compat/dyndef";

const createCookie = (name, value, {path, secure, sameSite}) =>
  `${name}=${value};HttpOnly;Path=${path};${secure};SameSite=${sameSite}`;

// gets a cookie id and returns it if exists, otherwise generates a new one
const inMemory = () => {
  const store = new Set();
  return id => {
    if (store.has(id)) {
      return {id};
    }

    const newId = crypto.randomUUID();
    store.add(newId);
    return {id: newId};
  };
};

export default ({
  name = "sessionId",
  sameSite = "Strict",
  path = "/",
  manager = inMemory(),
} = {}) => {
  is(name).string();
  is(sameSite).string();
  is(path).string();
  const options = {sameSite, path};
  return {
    name: "@primate/session",
    load(app = {}) {
      options.secure = app.secure ? ";Secure" : "";
    },
    async handle(request, next) {
      const id = request.cookies[name];
      const session = manager(id);
      is(session.id).string();

      const response = await next({...request, session});
      // only send the cookie if it different than the received one
      if (session.id !== id) {
        const cookie = createCookie(name, session.id, options);
        response.headers.set("Set-Cookie", cookie);
      }
      return response;
    },
  };
};
