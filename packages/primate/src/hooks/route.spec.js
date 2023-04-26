import route from "./route.js";
import {URL} from "runtime-compat/http";

const app = {
  routes: [
    ["index", {get: () => "/"}],
    ["user", {get: () => "/user"}],
    ["users/{userId}a", {get: ({path}) => `/users/${path.userId}a`}],
  ],
};

export default test => {
  const router = route(app);
  const r = pathname => router({
    request: {method: "GET"},
    url: new URL(pathname, "http://p.com")});

  test.reassert(assert => ({
    match: (path, result) => assert(r(path)).equals(result ?? path),
    fail: (path, result) =>
      assert(() => r(path)).throws(`no GET route to ${result ?? path}`),
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
};
