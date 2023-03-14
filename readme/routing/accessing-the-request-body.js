export default router => {
  router.post("/site/login", ({body}) => `submitted user: ${body.username}`);
};
