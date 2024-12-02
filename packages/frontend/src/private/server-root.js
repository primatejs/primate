export default async (app, name, create_root, compile) => {
  const filename = `root_${name}.js`;
  const root = await compile(create_root(app.depth()));
  const path = app.runpath(app.config("location.server"), filename);
  await path.write(root);
  app.roots.push(path);
};
