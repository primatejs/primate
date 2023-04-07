// Use an explicit handler as we can't detect HTML by the return value type
export default (router, {html}) => {
  // Embed components/hello-world.html into static/index.html and serve it. In
  // case a user-provided index.html doesn't exist, use a fallback index.html
  router.get("/hello", () => html("hello-world"));

  // Same as above, but without embedding
  router.get("/hello-partial", () => html("hello-world", {partial: true}));

  // Serve directly from string instead of loading a component
  router.get("/hello-adhoc", () => html("<p>Hello, world!</p>", {adhoc: true}));
};
