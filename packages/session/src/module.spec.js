import module from "./module.js";

const response = () => ({ headers: new Map() });
const init = (config, app = {}) => {
  const session = module(config);
  session.init(app, _ => _);
  return session;
};

const initi = (config, app = {}) => init({ ...config, implicit: true }, app);

const create_cookies = data => ({ cookies: { get: () => data } });
const request = () => create_cookies();

const UUID = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/u;

export default test => {
  test.case("implicit", async assert => {
    const next = ({ session }) => {
      assert(session).defined();
      assert(session.id).undefined();
      assert(session.getAll()).equals({});
      return response();
    };

    const explicit = init({});
    const e = await explicit.handle(request(), next);
    assert(e.headers.has("Set-Cookie")).false();

    const implicit = initi();
    const i = await implicit.handle(request(), next);
    assert(i.headers.has("Set-Cookie")).true();
  });
  test.case("set Set-Cookie when no session", async assert => {
    const next = async ({ session }) => {
      assert(session).defined();
      assert(session.id).undefined();
      assert(session.getAll()).equals({});
      await session.create();
      return response();
    };

    const explicit = init({});
    const e = await explicit.handle(request(), next);
    assert(e.headers.has("Set-Cookie")).true();

    const implicit = initi();
    const i = await implicit.handle(request(), next);
    assert(i.headers.has("Set-Cookie")).true();
  });
  test.case("don't set Set-Cookie when session is found", async assert => {
    const session = initi();
    const next = async ({ session }) => {
      assert(session).defined();
      assert(session.id).undefined();
      assert(session.getAll()).equals({});
      return response();
    };

    const r = await session.handle(request(), next);
    const [cookie] = r.headers.get("Set-Cookie").split(";");
    const [, session_id] = cookie.split("=");
    const request2 = create_cookies(session_id);

    const next2 = sessionId => ({ session }) => {
      assert(session).defined();
      assert(session.id).equals(sessionId);
      assert(session.getAll()).equals({});
      return response();
    };

    const r2 = await session.handle(request2, next2(session_id));
    assert(r2.headers.has("Set-Cookie")).false();
  });
  test.case("name: default to 'sessionId'", async assert => {
    const session = initi();
    const r = await session.handle(request(), () => response());
    assert(r.headers.get("Set-Cookie").startsWith("sessionId")).true();
  });
  test.case("name: make configurable", async assert => {
    const session = initi({ name: "session_id" });
    const r = await session.handle(request(), () => response());
    assert(r.headers.get("Set-Cookie").startsWith("session_id")).true();
  });
  test.case("SameSite: default to Strict", async assert => {
    const session = initi();
    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "SameSite=Strict")).true();
  });
  test.case("SameSite: make configurable", async assert => {
    const session = initi({ sameSite: "Lax" });
    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "SameSite=Lax")).true();
  });
  test.case("HttpOnly: default to true", async assert => {
    const session = initi();
    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "HttpOnly")).true();
  });
  test.case("HttpOnly: make configurable", async assert => {
    const session = initi({ httpOnly: false });
    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.every(part => part !== "HttpOnly")).true();
  });
  test.case("Path: default to \"/\"", async assert => {
    const session = initi();
    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "Path=/")).true();
  });
  test.case("Path: make configurable", async assert => {
    const session = initi({ path: "/blog" });
    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "Path=/blog")).true();
  });
  test.case("Secure: don't set by default", async assert => {
    const session = initi();

    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");

    assert(parts.every(part => !part.startsWith("Secure"))).true();
  });
  test.case("Secure: set when {secure: true}", async assert => {
    const session = initi({}, { secure: true });

    const r = await session.handle(request(), () => response());
    const parts = r.headers.get("Set-Cookie").split(";");

    assert(parts.some(part => part.startsWith("Secure"))).true();
  });
  test.case("manager: provide default", async assert => {
    const session = initi();

    const r = await session.handle(request(), () => response());
    const [, id] = r.headers.get("Set-Cookie").split(";")[0].split("=");
    // this tests for a UUID, being the best heuristics for the default manager
    assert(UUID.test(id)).true();
  });
  test.case("manager: make configurable", async assert => {
    // this manager ignores all input and always returns "1"
    const session = initi({ manager: () => ({
      id: 1,
      create() {
        return null;
      },
      destroy() {
        return null;
      },
    }) });

    const r = await session.handle(request(), () => response());
    const [, id] = r.headers.get("Set-Cookie").split(";")[0].split("=");
    assert(id).equals("1");

    const r2 = await session.handle(request(), () => response());
    const [, id2] = r2.headers.get("Set-Cookie").split(";")[0].split("=");
    assert(id2).equals("1");
  });
  test.case("manager: throw when manager doesn't return a {create, destroy}",
    async assert => {
      const create = initi({ manager: () => ({ create: () => null }) });
      assert(() => create.handle(request(), () => response())).throws();
      const destroy = initi({ manager: () => ({ destroy: () => null }) });
      assert(() => destroy.handle(request(), () => response())).throws();
    },
  );
  test.case("set: throw when no session", async assert => {
    const explicit = init({});
    const next = async ({ session }) => {
      assert(session).defined();
      assert(session.id).undefined();
      assert(session.getAll()).equals({});
      assert(() => session.set({})).throws();
      await session.create();
      assert(() => session.set({})).nthrows();
      return response();
    };

    await explicit.handle(request(), next);
  });
};
