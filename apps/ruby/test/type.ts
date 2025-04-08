import test from "primate/test";

Object.entries({
  hash: { name: "Donald" },
  array: [ { name: "Donald" }, { name: "Ryan" } ],
  str: "Hello, world!",
}).forEach(([path, body]) => {
  test.get(`/type/${path}`, response => {
    response.body.equals(body);
  });
});
