import {File} from "runtime-compat/filesystem";

export default router => {
  router.get("/users", () => File.readable("users.json"));
};
