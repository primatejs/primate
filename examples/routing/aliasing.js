export default router => {
  // will replace "_id" in any path with "([0-9])+"
  router.alias("_id", "([0-9])+");

  // equivalent to `router.get(/user/view/([0-9])+, ...)`
  // will return id if matched, 404 otherwise
  router.get("/user/view/_id", request => request.path[2]);

  // can be combined with named groups
  router.alias("_name", "(<name>[a-z])+");

  // will return name if matched, 404 otherwise
  router.get("/user/view/_name", request => request.named.name);
};
