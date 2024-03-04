export default (app, name) =>
  app.root.join(app.get("location.components"), `__ROOT__.${name}`);
