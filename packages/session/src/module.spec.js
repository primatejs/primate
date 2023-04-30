import module from "./module.js";

const response = () => ({headers: new Map()});
const init = (config, app) => {
  const session = module(config);
  session.load(app);
  return {
    session,
    request: {cookies: {}},
    response: response(),
  };
};

const UUID = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/u;

export default test => {
  test.case("set Set-Cookie when no session is found", async assert => {
    const {session, request} = init();

    const r = await session.handle(request, response);
    assert(r.headers.has("Set-Cookie")).true();
  });
  test.case("don't set Set-Cookie when session is found", async assert => {
    const {session, request} = init();

    const r = await session.handle(request, response);
    const [cookie] = r.headers.get("Set-Cookie").split(";");
    const [, sessionId] = cookie.split("=");
    request.cookies = {sessionId};

    const r2 = await session.handle(request, response);
    assert(r2.headers.has("Set-Cookie")).false();
  });
  test.case("name: default to 'sessionId'", async assert => {
    const {session, request} = init();
    const r = await session.handle(request, response);
    assert(r.headers.get("Set-Cookie").startsWith("sessionId")).true();
  });
  test.case("name: make configurable", async assert => {
    const {session, request} = init({name: "session_id"});
    const r = await session.handle(request, response);
    assert(r.headers.get("Set-Cookie").startsWith("session_id")).true();
  });
  test.case("SameSite: default to Strict", async assert => {
    const {session, request} = init();
    const r = await session.handle(request, response);
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "SameSite=Strict")).true();
  });
  test.case("SameSite: make configurable", async assert => {
    const {session, request} = init({sameSite: "Lax"});
    const r = await session.handle(request, response);
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "SameSite=Lax")).true();
  });
  test.case("Path: default to \"/\"", async assert => {
    const {session, request} = init();
    const r = await session.handle(request, response);
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "Path=/")).true();
  });
  test.case("Path: make configurable", async assert => {
    const {session, request} = init({path: "/blog"});
    const r = await session.handle(request, response);
    const parts = r.headers.get("Set-Cookie").split(";");
    assert(parts.some(part => part === "Path=/blog")).true();
  });
  test.case("Secure: don't set by default", async assert => {
    const {session, request} = init();

    const r = await session.handle(request, response);
    const parts = r.headers.get("Set-Cookie").split(";");

    assert(parts.every(part => !part.startsWith("Secure"))).true();
  });
  test.case("Secure: set when {secure: true}", async assert => {
    const {session, request} = init({}, {secure: true});

    const r = await session.handle(request, response);
    const parts = r.headers.get("Set-Cookie").split(";");

    assert(parts.some(part => part.startsWith("Secure"))).true();
  });
  test.case("manager: provide default", async assert => {
    const {session, request} = init();

    const r = await session.handle(request, response);
    const [, id] = r.headers.get("Set-Cookie").split(";")[0].split("=");
    // this tests for a UUID, being the best heuristics for the default manager
    assert(UUID.test(id)).true();
  });
  test.case("manager: make configurable", async assert => {
    // this manager ignores all input and always returns "1"
    const {session, request} = init({manager: () => ({id: "1"})});

    const r = await session.handle(request, response);
    const [, id] = r.headers.get("Set-Cookie").split(";")[0].split("=");
    assert(id).equals("1");

    const r2 = await session.handle(request, response);
    const [, id2] = r2.headers.get("Set-Cookie").split(";")[0].split("=");
    assert(id2).equals("1");
  });
  test.case("manager: throw when manager doesn't return a session.id as string",
    async assert => {
      // this manager ignores all input and always returns 1
      const {session, request} = init({manager: () => ({id: 1})});

      assert(() => session.handle(request, response)).throws();
    }
  );
};
