import crypto from "runtime-compat/crypto";

const extractId = header => header
  ?.split(";").filter(text => text.includes("session_id="))[0]?.split("=")[1];

const createCookie = (session_id, {secure, sameSite}) =>
  `session_id=${session_id};Path=/;HttpOnly${secure};${sameSite}`;

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

export default ({manager = inMemory(), sameSite = "Strict"} = {}) => {
  const options = {sameSite};
  return {
    config(app) {
      options.secure = app.secure ? ";Secure": "";
    },
    async serve(request, next) {
      const id = extractId(request.original.headers.get("cookie"));
      const session = manager(id);
      const cookie = createCookie(session.id, options);

      const response = await next({...request, session});
      response.headers.set("Set-Cookie", cookie);
      return response;
    },
  }
};
