import route from "./route.js";

const app = {
  routes: [
    "index",
    "user",
    "users/{userId}a",
    "comments/{commentId:comment}",
    "users/{userId}/comments/{commentId}",
    "users/{userId:user}/comments/{commentId}/a",
    "users/{userId:user}/comments/{commentId:comment}/b",
    "users/{_userId}/comments/{commentId}/d",
    "users/{_userId}/comments/{_commentId}/e",
    "comments2/{_commentId}",
    "users2/{_userId}/{commentId}",
    "users3/{_userId}/{_commentId:_commentId}",
    "users4/{_userId}/{_commentId}",
    "users5/{truthy}",
    "{uuid}/{Uuid}/{UUID}",
  ].map(pathname => [pathname, {get: request => request}]),
  types: {
    user: id => /^\d*$/u.test(id),
    comment: id => /^\d*$/u.test(id),
    _userId: id => /^\d*$/u.test(id),
    _commentId: id => /^\d*$/u.test(id),
    truthy: () => 1,
    uuid: _ => _ === "uuid",
    Uuid: _ => _ === "Uuid",
    UUID: _ => _ === "UUID",
  },
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
    match: (url, result) => {
      assert(r(url).url.pathname).equals(result ?? url);
    },
    fail: (url, result) =>
      assert(() => r(url)).throws(`no GET route to ${result ?? url}`),
    path: (url, result) => assert(r(url).path).equals(result),
    assert,
  }));

  /* early exits {{{ */
  test.case("must not have the same route twice", ({assert}) => {
    assert(() => route({routes: [["post"], ["post"]]})).throws();
  });
  test.case("must not contain same parameter twice", ({assert}) => {
    assert(() => route({routes: [["{userId}/{userId}"]]})).throws();
  });
  test.case("must not contain illegal characters in params", ({assert}) => {
    assert(() => route({routes: [["{user$Id}"]]})).throws();
  });
  test.case("must not contain illegal characters in types", ({assert}) => {
    assert(() => route({routes: [], types: {us$er: () => null}})).throws();
  });
  /* }}} */

  test.case("index route", ({match}) => {
    match("/");
  });
  test.case("simple route", ({match}) => {
    match("/user");
  });
  test.case("param match/fail", ({match, fail}) => {
    match("/users/1a");
    match("/users/aa");
    match("/users/ba?key=value", "/users/ba");
    fail("/user/1a");
    fail("/users/a");
    fail("/users/aA");
    fail("/users//a");
    fail("/users/?a", "/users/");
  });
  test.case("no params", ({path}) => {
    path("/", {});
  });
  test.case("single param", ({path}) => {
    path("/users/1a", {userId: "1"});
  });
  test.case("params", ({path, fail}) => {
    path("/users/1/comments/2", {userId: "1", commentId: "2"});
    path("/users/1/comments/2/b", {userId: "1", commentId: "2"});
    fail("/users/d/comments/2/b");
    fail("/users/1/comments/d/b");
    fail("/users/d/comments/d/b");
  });
  test.case("single typed param", ({path, fail}) => {
    path("/comments/1", {commentId: "1"});
    fail("/comments/ ", "/comments");
    fail("/comments/1d");
  });
  test.case("mixed untyped and typed params", ({path, fail}) => {
    path("/users/1/comments/2/a", {userId: "1", commentId: "2"});
    fail("/users/d/comments/2/a");
  });
  test.case("single implicit typed param", ({path, fail}) => {
    path("/comments2/1", {_commentId: "1"});
    fail("/comments2/d");
  });
  test.case("mixed implicit and untyped params", ({path, fail}) => {
    path("/users2/1/2", {_userId: "1", commentId: "2"});
    fail("/users2/d/2");
    fail("/users2/d");
  });
  test.case("mixed implicit and explicit params", ({path, fail}) => {
    path("/users3/1/2", {_userId: "1", _commentId: "2"});
    fail("/users3/d/2");
    fail("/users3/1/d");
    fail("/users3");
  });
  test.case("implicit params", ({path, fail}) => {
    path("/users4/1/2", {_userId: "1", _commentId: "2"});
    fail("/users4/d/2");
    fail("/users4/1/d");
    fail("/users4");
  });
  test.case("fail not strictly true implicit params", ({fail}) => {
    fail("/users5/any");
  });
  test.case("different case params", ({path, fail}) => {
    path("/uuid/Uuid/UUID", {uuid: "uuid", Uuid: "Uuid", UUID: "UUID"});
    fail("/uuid/uuid/uuid");
    fail("/Uuid/UUID/uuid");
    fail("/UUID/uuid/Uuid");
  });
};
