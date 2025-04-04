import test from "primate/test";

Object.entries({
  dict: { name: "Donald" },
  list: [ { name: "Donald" }, { name: "Ryan" } ],
  str: "Hello, world!",
  tuple: [ { name: "Donald" }, { name: "Ryan" } ],
}).forEach(([path, body]) => {
  test.get(`/type/${path}`, response => {
    response.body.equals(body);
  });
});
