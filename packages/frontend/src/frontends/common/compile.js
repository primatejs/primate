const create = {
  async server_root(app, name, create_root, compile) {
    // vue does not yet support layouting
    if (create_root !== undefined) {
      const filename = `root_${name}.js`;
      const root = await compile.server(create_root(app.layout.depth));
      await app.runpath(app.get("location.server"), filename).write(root);
    }
  },
  async client_root(app, name, create_root, compile) {
    // vue does not yet support layouting
    if (create_root !== undefined) {
      const root = create_root(app.layout.depth);
      app.build.save(`root:${name}`, (await compile.client(root)).js);
      app.export({
        type: "script",
        code: `export { default as root_${name} } from "root:${name}";\n`,
      });
    }
  },
};

export default async ({
  app,
  extension,
  name,
  create_root,
  compile,
  normalize,
}) => {
  const extensions = {
    from: extension,
    to: `${extension}.js`,
  };
  await create.server_root(app, name, create_root, compile);
  await create.client_root(app, name, create_root, compile);

  const location = app.get("location");
  const source = app.path.components;

  return {
    async server(component) {
      const target_base = app.runpath(location.server, location.components);
      const code = await compile.server(await component.text(), component, app);
      const path = target_base.join(`${component.path}.js`.replace(source, ""));
      await path.directory.create();
      await path.write(code.replaceAll(extensions.from, extensions.to));
    },
    async client(component) {
      const { path: name } = component.debase(source, "/");

      // web import -> unix style
      const file_string = `./${location.components}/${name}`;
      const imported = await normalize(name);
      app.export({
        type: "script",
        code: `export { default as ${imported} } from "${file_string}";\n`,
      });
    },
  };
};
