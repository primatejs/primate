import {MediaType} from "runtime-compat/http";
import parse from "./parse.js";
import {mark} from "../Logger.js";
import dispatch from "../dispatch.js";

const contentType = MediaType.APPLICATION_JSON;
const r = await (async () => {
  const p = "https://p.com";
  const request = (method, path = "/", options = {}) =>
    new Request(`${p}${path}`, {method, ...options});
  return Object.fromEntries(["get", "post", "put", "delete"].map(verb =>
    [verb, (...args) =>
      parse(dispatch())(request(verb.toUpperCase(), ...args))]));
})();

const d = dispatcher => {
  const p = "https://p.com";
  const request = (method, path = "/", options = {}) =>
    new Request(`${p}${path}`, {method, ...options});
  return Object.fromEntries(["get", "post", "put", "delete"].map(verb =>
    [verb, (...args) =>
      parse(dispatcher)(request(verb.toUpperCase(), ...args))]));
};

export default test => {
  test.case("no body => null", async assert => {
    assert((await r.get("/")).body.get()).null();
    assert((await r.post("/")).body.get()).null();
  });
  test.case("body is application/json", async assert => {
    const body = JSON.stringify({foo: "bar"});
    const headers = {"Content-Type": contentType};
    const response = await r.post("/", {body, headers});
    assert(response.body.get()).equals({foo: "bar"});
    assert(response.body.get("foo")).equals("bar");
    assert(response.body.get("bar")).undefined();

    const faulty = `${body}%`;
    assert(() => r.post("/", {body: faulty, headers}))
      .throws(mark("cannot parse body {0} as {1}", faulty, contentType));
  });
  test.case("body is application/x-www-form-urlencoded", async assert => {
    const {body} = await r.post("/", {
      body: encodeURI("foo=bar &bar=baz"),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    assert(body.get()).equals({foo: "bar ", bar: "baz"});
    assert(body.get("foo")).equals("bar ");
    assert(body.get("bar")).equals("baz");
    assert(body.get("baz")).undefined();
  });
  test.case("url / path traversal", async assert => {
    const matches = (urls, expected) =>
      Promise.all(urls.map(async url => {
        const {pathname} = (await r.get(`/${url}`)).url;
        assert(await pathname).equals(expected.toString());
      }));
    await matches([
      "..",
      "../",
      "/",
      "//",
      "../..",
      "../../",
      "../../.",
      "%2E",
      "%2e",
      "%2E%2e",
      "%2e%2e",
      "%2E%2e",
      "%2e%2e%2f",
      "%2e%2e/",
      "..%2f",
      "..%5c",
      "..\\",
    ], "/");
  });
  test.case("query", async assert => {
    assert((await r.get("/")).query.get()).equals({});
    const response1 = await r.get("/?foo=bar");
    assert(response1.query.get()).equals({foo: "bar"});
    assert(response1.query.get("foo")).equals("bar");
    assert(response1.query.get("bar")).undefined();
    const response2 = await r.get("/?foo=bar&bar=baz");
    assert(response2.query.get()).equals({foo: "bar", bar: "baz"});
    assert(response2.query.get("foo")).equals("bar");
    assert(response2.query.get("bar")).equals("baz");
    assert(response2.query.get("baz")).undefined();
  });
  test.case("cookies", async assert => {
    assert((await r.get("/")).cookies.get()).equals({});

    const response0 = await r.get("/?key=value", {headers: {
      Cookie: "",
    }});
    assert(response0.cookies.get()).equals({});

    const response1 = await r.get("/?key=value", {headers: {
      Cookie: "key=value",
    }});
    assert(response1.cookies.get()).equals({key: "value"});
    assert(response1.cookies.get("key")).equals("value");
    assert(response1.cookies.get("key2")).undefined();

    const response1a = await r.get("/?key=value", {headers: {
      Cookie: "key=value;",
    }});
    assert(response1a.cookies.get()).equals({key: "value"});
    assert(response1a.cookies.get("key")).equals("value");
    assert(response1a.cookies.get("key2")).undefined();

    const response2 = await r.get("/?key=value", {headers: {
      Cookie: "key=value;key2=value2",
    }});
    assert(response2.cookies.get()).equals({key: "value", key2: "value2"});
    assert(response2.cookies.get("key")).equals("value");
    assert(response2.cookies.get("key2")).equals("value2");
    assert(response2.cookies.get("key3")).undefined();
  });
  test.case("headers", async assert => {
    assert((await r.get("/")).headers.get()).equals({});

    const response1 = await r.get("/?key=value", {headers: {
      "X-User": "Donald",
    }});

    assert(response1.headers.get()).equals({"x-user": "Donald"});
    assert(response1.headers.get("x-user")).equals("Donald");
    assert(response1.headers.get("X-User")).equals("Donald");
    assert(response1.headers.get("X-USER")).equals("Donald");
    assert(response1.headers.get("x-user2")).undefined();
    assert(response1.headers.get("X-User2")).undefined();
    assert(response1.headers.get("X-USER2")).undefined();
  });
  test.case("cookies double as headers", async assert => {
    const response = await r.get("/?key=value", {
      headers: {
        Cookie: "key=value",
      },
    });
    assert(response.headers.get()).equals({cookie: "key=value"});
    assert(response.headers.get("cookie")).equals("key=value");
    assert(response.cookies.get()).equals({key: "value"});
    assert(response.cookies.get("key")).equals("value");
  });
  test.case("dispatch", async assert => {
    const number = (value, name) => {
      const n = Number(value);
      if (Number.isNaN(n)) {
        throw new Error(`${name} is not a number`);
      }
      return n;
    };
    const {post} = d(dispatch({number}));
    // body
    const {body} = await post("/", {
      body: encodeURI("foo=bar &bar=baz&val=3"),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const pre = "mismatched type: {0}";
    const nan = "is not a number";
    assert(() => body.getNumber("foo")).throws(mark(pre, `foo ${nan}`));
    assert(() => body.getNumber("bar")).throws(mark(pre, `bar ${nan}`));
    assert(body.getNumber("val")).equals(3);
  });
  test.case("raw", async assert => {
    const body = JSON.stringify({foo: "bar"});
    const headers = {
      "Content-Type": contentType,
      Cookie: "key=value",
    };
    const response = await r.post("/?foo=bar", {body, headers});
    assert(response.body.raw).equals("{\"foo\":\"bar\"}");
    assert(response.query.raw).equals("?foo=bar");
    assert(response.headers.raw.get("content-type")).equals(contentType);
    assert(response.cookies.raw).equals("key=value");
  });
};
