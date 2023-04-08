export default router => {
  // Declare `"edit-user"` as alias of `"/user/edit/([0-9])+"`
  router.alias("edit-user", "/user/edit/([0-9])+");

  // Pass user instead of request to all verbs on this route
  router.map("edit-user", ({body}) => body?.name ?? "Donald");

  // Show user as plain text
  router.get("edit-user", user => user);

  // Verify or show error
  router.post("edit-user", user => user === "Donald"
    ? "Hi Donald!"
    : {message: "Error saving user"});
};
