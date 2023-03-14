export default router => {
  // accessing /site/login will serve the `Hello, world!` as plain text
  router.get("/site/login", () => "Hello, world!");
};
