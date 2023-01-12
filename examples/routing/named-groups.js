export default router => {
  // named groups are mapped to properties of request.named
  // accessing /user/view/1234 will serve `1234` as plain text
  router.get("/user/view/(<id>[0-9])+", ({named}) => named.id);
};
