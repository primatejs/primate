export default routes => routes.join("index.js").write(`export default {
  get() {
    return "Hello, world!";
  },
};`);
