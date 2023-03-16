import {File} from "runtime-compat/filesystem";

export default router => {
  // `File` implements `readable`, which is a `ReadableStream`
  router.get("/users", () => new File("users.json"));
};
