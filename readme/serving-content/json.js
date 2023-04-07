import {File} from "runtime-compat/filesystem";

export default router => {
  // Serve proper JavaScript objects as JSON
  router.get("/users", () => [
    {name: "Donald"},
    {name: "Ryan"},
  ]);

  // Load from file and serve as JSON
  router.get("/users-from-file", () => File.json("users.json"));
};
