import Status from "primate/http/Status";
import test from "primate/test";

test.get("/handler/error", response => {
  response.status.equals(Status.NOT_FOUND);
  response.body.has("Python error");
});

test.get({ path: "/handler/redirect", redirect: "manual" }, response => {
  response.status.equals(Status.FOUND);
  response.headers.has({ Location: "/redirected" });
});

test.get("/handler/view", response => {
  response.body.has(`<h1>View</h1>

Hello, world.`);
});
