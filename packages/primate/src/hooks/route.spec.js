import route from "./route.js";

const app = {
  routes: [
    ["index", {get: request => request}],
    ["user", {get: request => request}],
    ["users/{userId}a", {get: request => request}],
  ],
};

export default test => {
  const router = route(app);
  const p = "https://p.com";
  const r = pathname => {
    const original = new Request(`${p}${pathname}`, {method: "GET"});
    const {url} = original;
    return router({
      original,
      url: new URL(url.endsWith("/") ? url.slice(0, -1) : url),
    });
  };

  test.reassert(assert => ({
    match: (url, pathname) => {
      assert(r(url).url.pathname).equals(pathname ?? url);
    },
    fail: (path, result) =>
      assert(() => r(path)).throws(`no GET route to ${result ?? path}`),
    assert,
  }));

  test.case("index route", ({match}) => {
    match("/");
  });
  test.case("simple route", ({match}) => {
    match("/user");
  });
  test.case("parameter", ({match, fail}) => {
    match("/users/1a");
    match("/users/aa");
    match("/users/ba?key=value", "/users/ba");
    fail("/user/1a");
    fail("/users/a");
    fail("/users/aA");
    fail("/users//a");
    fail("/users/?a", "/users/");
  });
  test.case("path without parameter", async ({assert}) => {
    assert(r("/").path).equals({});
  });
  test.case("path with parameter", async ({assert}) => {
    assert(r("/users/1a").path.userId).equals("1");
  });
};
