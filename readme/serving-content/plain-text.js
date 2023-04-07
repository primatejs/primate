export default router => {
  // Serve strings as plain text
  router.get("/user", () => "Donald");
};
