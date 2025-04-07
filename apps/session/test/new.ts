import test from "primate/test";

test.get("/new", response => {
  response.body.equals("no session");
});
