export default router => {
  // strings will be served as plain text
  router.get("/user", () => "Donald");
};
