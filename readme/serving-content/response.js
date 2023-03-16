import {Response} from "runtime-compat/http";

export default router => {
  // use a generic response instance for a custom response status
  router.get("/create", () => new Response("created!", {status: 201}));
};
