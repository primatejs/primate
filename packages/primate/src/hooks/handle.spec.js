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
};
