export default router => {
  // accessing /site/login will serve `["site", "login"]` as JSON
  router.get("/site/login", request => request.path);
};
