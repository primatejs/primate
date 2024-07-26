import { MediaType } from "rcompat/http";
import * as O from "rcompat/object";
import { mark } from "../../shared/Logger.js";
import config from "../defaults/primate.config.js";
import parse from "./parse.js";

const { APPLICATION_JSON, APPLICATION_FORM_URLENCODED } = MediaType;
const app = {
  get: config_key => O.get(config, config_key),
};
const verbs = ["get", "post", "put", "delete"];
const r = await (async () => {
  const p = "https://p.com";
  const request = (method, path = "/", options = {}) =>
    new Request(`${p}${path}`, { method, ...options });
  return Object.fromEntries(verbs.map(verb => [verb, (...args) =>
    parse(app)(request(verb.toUpperCase(), ...args))]));
})();

export default test => {

  test.case("no body => {}", async assert => {
    assert((await r.get("/")).body).equals({});
    assert((await r.post("/")).body).equals({});
  });

  test.case("body application/json", async assert => {
    const body = JSON.stringify({ foo: "bar" });
    const headers = { "Content-Type": APPLICATION_JSON };
    const response = await r.post("/", { body, headers });
    assert(response.body).equals({ foo: "bar" });
    assert(response.body.foo).equals("bar");
    assert(response.body.bar).undefined();

    const faulty = `${body}%`;
    const error = `cannot parse body with content type ${APPLICATION_JSON}`;
    const throws = mark("{0}: {1}", "/", error);
    assert(() => r.post("/", { body: faulty, headers })).throws(throws);
  });

  test.case("body is application/x-www-form-urlencoded", async assert => {
    const { body } = await r.post("/", {
       body: encodeURI("foo=bar &bar=baz"),
       headers: {
         "Content-Type": APPLICATION_FORM_URLENCODED,
       },
    });

    assert(body).equals({ foo: "bar ", bar: "baz" });
    assert(body.foo).equals("bar ");
    assert(body.bar).equals("baz");
    assert(body.baz).undefined();
  });

  test.case("url / path traversal", async assert => {
    const matches = (urls, expected) =>
      Promise.all(urls.map(async url => {
        const { pathname } = (await r.get(`/${url}`)).url;
        assert(await pathname).equals(expected.toString());
      }));
    await matches([
      "..",
      "../",
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
    assert((await r.get("/")).query.json()).equals({});
    const response1 = await r.get("/?foo=bar");
    assert(response1.query.json()).equals({ foo: "bar" });
    assert(response1.query.get("foo")).equals("bar");
    assert(response1.query.get("bar")).undefined();
    const response2 = await r.get("/?foo=bar&bar=baz");
    assert(response2.query.json()).equals({ foo: "bar", bar: "baz" });
    assert(response2.query.get("foo")).equals("bar");
    assert(response2.query.get("bar")).equals("baz");
    assert(response2.query.get("baz")).undefined();
    const response3 = await r.get("/?url=https://primatejs.com");
    assert(response3.query.json()).equals({ url: "https://primatejs.com" });
    assert(response3.query.get("url")).equals("https://primatejs.com");
  });

  test.case("cookies", async assert => {
    assert((await r.get("/")).cookies.json()).equals({});

    const response0 = await r.get("/?key=value", { headers: { Cookie: "" } });
    assert(response0.cookies.json()).equals({});

    const response1 = await r.get("/?key=value", { headers: {
      Cookie: "key=value",
    } });
    assert(response1.cookies.json()).equals({ key: "value" });
    assert(response1.cookies.get("key")).equals("value");
    assert(response1.cookies.get("key2")).undefined();

    const response1a = await r.get("/?key=value", { headers: {
      Cookie: "key=value;",
    } });
    assert(response1a.cookies.json()).equals({ key: "value" });
    assert(response1a.cookies.get("key")).equals("value");
    assert(response1a.cookies.get("key2")).undefined();

    const response2 = await r.get("/?key=value", { headers: {
     Cookie: "key=value;key2=value2",
    } });
    assert(response2.cookies.json()).equals({ key: "value", key2: "value2" });
    assert(response2.cookies.get("key")).equals("value");
    assert(response2.cookies.get("key2")).equals("value2");
    assert(response2.cookies.get("key3")).undefined();
  });

  test.case("headers", async assert => {
    assert((await r.get("/")).headers.json()).equals({});

    const response1 = await r.get("/?key=value", { headers: {
       "X-User": "Donald",
    } });

    assert(response1.headers.json()).equals({ "x-user": "Donald" });
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
    assert(response.headers.json()).equals({ cookie: "key=value" });
    assert(response.headers.get("cookie")).equals("key=value");
    assert(response.cookies.json()).equals({ key: "value" });
    assert(response.cookies.get("key")).equals("value");
  });

  test.case("raw", async assert => {
    const headers = { "Content-Type": APPLICATION_JSON, Cookie: "key=value" };
    const response = await r.post("/?foo=bar", { body: null, headers });
    assert(response.query.raw).equals("?foo=bar");
    assert(response.headers.raw.get("content-type")).equals(APPLICATION_JSON);
    assert(response.cookies.raw).equals("key=value");
  });

};
