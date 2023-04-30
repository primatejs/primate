import handle from "./handle.js";
import Logger from "../Logger.js";

const app = {
  log: new Logger({
    level: Logger.Warn,
  }),
  config: {
    http: {},
  },
  modules: [{
    handle(request) {
      return request;
    },
  }],
  routes: [
    ["index", {get: () => "/"}],
    ["user", {get: () => "/user"}],
    ["users/{userId}a", {get: request => request}],
  ],
};

const r = await (async () => {
  const p = "https://p.com";
  const request = (method, path = "/", options = {}) =>
    new Request(`${p}${path}`, {method, ...options});
  const handler = await handle(app);
  return Object.fromEntries(["get", "post", "put", "delete"].map(verb =>
    [verb, (...args) => handler(request(verb.toUpperCase(), ...args))]));
})();

export default test => {
  test.case("no body => null", async assert => {
    assert((await r.get("/")).body).null();
    assert((await r.post("/")).body).null();
  });
  test.case("body is application/json", async assert => {
    assert((await r.post("/", {
      body: JSON.stringify({foo: "bar"}),
      headers: {
        "Content-Type": "application/json",
      },
    })).body).equals({foo: "bar"});
  });
  test.case("body is application/x-www-form-urlencoded", async assert => {
    assert((await r.post("/", {
      body: encodeURI("foo=bar &bar=baz"),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })).body).equals({foo: "bar ", bar: "baz"});
  });
  test.case("no query => {}", async assert => {
    assert((await r.get("/")).query).equals({});
  });
  test.case("query", async assert => {
    assert((await r.get("/?key=value")).query).equals({key: "value"});
  });
  test.case("no cookies => {}", async assert => {
    assert((await r.get("/")).cookies).equals({});
  });
  test.case("cookies", async assert => {
    assert((await r.get("/?key=value", {
      headers: {
        Cookie: "key=value;key2=value2",
      },
    })).cookies).equals({key: "value", key2: "value2"});
  });
  test.case("no headers => {}", async assert => {
    assert((await r.get("/")).headers).equals({});
  });
  test.case("headers", async assert => {
    assert((await r.get("/?key=value", {
      headers: {
        "X-User": "Donald",
      },
    })).headers).equals({"x-user": "Donald"});
  });
  test.case("cookies double as headers", async assert => {
    const response = await r.get("/?key=value", {
      headers: {
        Cookie: "key=value",
      },
    });
    assert(response.headers).equals({cookie: "key=value"});
    assert(response.cookies).equals({key: "value"});
  });
};
