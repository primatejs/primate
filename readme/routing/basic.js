export default router => {
  // accessing /site/login will serve `Hello, world!` as plain text
  router.get("/site/login", () => "Hello, world!");
};
