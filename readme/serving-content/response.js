import {Response} from "runtime-compat/http";

export default router => {
  // Use a Response object for custom response status
  router.get("/create", () => new Response("created!", {status: 201}));
};
