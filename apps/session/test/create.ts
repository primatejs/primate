import test from "primate/test";

test.get("/create", response => {
  response.headers.get("Set-Cookie").includes("-");
  response.body.equals({ foo: "bar" });
});
