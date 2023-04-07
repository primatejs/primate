export default (router, {redirect}) => {
  // redirect from source to target
  router.get("/source", () => redirect("/target"));
};
