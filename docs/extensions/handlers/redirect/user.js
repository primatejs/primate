import redirect from "@primate/html";

export default router => {
  // redirect the request
  router.get("/user", () => redirect("/users"));
};
